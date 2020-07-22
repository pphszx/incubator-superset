# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=R
import requests
import simplejson as json
from nameko.standalone.rpc import ClusterRpcProxy
from flask import g, request
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access_api
from flask_login import current_user

from superset import conf, db, event_logger
from superset.common.query_context import QueryContext
from superset.legacy import update_time_range
from superset.models.slice import Slice
from superset.typing import FlaskResponse
from superset.utils import core as utils
from superset.views.base import api, BaseSupersetView, handle_api_exception


class Api(BaseSupersetView):
    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/query/", methods=["POST"])
    def query(self) -> FlaskResponse:
        """
        Takes a query_obj constructed in the client and returns payload data response
        for the given query_obj.

        raises SupersetSecurityException: If the user cannot access the resource
        """
        query_context = QueryContext(**json.loads(request.form["query_context"]))
        query_context.raise_for_access()
        payload_json = query_context.get_payload()
        return json.dumps(
            payload_json, default=utils.json_int_dttm_ser, ignore_nan=True
        )

    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/form_data/", methods=["GET"])
    def query_form_data(self) -> FlaskResponse:
        """
        Get the formdata stored in the database for existing slice.
        params: slice_id: integer
        """
        form_data = {}
        slice_id = request.args.get("slice_id")
        if slice_id:
            slc = db.session.query(Slice).filter_by(id=slice_id).one_or_none()
            if slc:
                form_data = slc.form_data.copy()

        update_time_range(form_data)

        return json.dumps(form_data)


class Sachima(BaseSupersetView):
    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/restful/", methods=["POST"])
    def restful(self):
        """
        RESTFul API
        """
        req_params = request.get_json()
        req_params["user"] = " ".join([current_user.first_name, current_user.last_name])
        req_params["email"] = current_user.email
        res = requests.post(
            conf.get("API_URL_CONFIG").get("RESTFUL"), json=req_params, timeout=300,
        )
        result = json.loads(res.text)
        return json.dumps(result), 201

    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/rpc/", methods=["POST"])
    def rpc(self):
        """
        Nameko RPC
        """
        req_params = request.get_json()
        req_params["user"] = " ".join([current_user.first_name, current_user.last_name])
        req_params["email"] = current_user.email
        CONFIG = {"AMQP_URI": conf.get("API_URL_CONFIG").get("RPC")}
        with ClusterRpcProxy(CONFIG) as rpc:
            res = rpc.data.get_report(req_params)
        return json.dumps(res), 201

    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/save_or_overwrite_slice/", methods=["GET", "POST"])
    def save_or_overwrite_slice(self):
        """
        modified from views/core: Save or overwrite a slice
        """
        if request.method == "POST":
            req_params = request.get_json()
            req_params["user"] = " ".join(
                [current_user.first_name, current_user.last_name]
            )
            req_params["email"] = current_user.email
            params = {
                "external_api_service": req_params.get("api", "rpc"),
                "external_api_param": req_params.get("params", ""),
            }
            slc = Slice(
                slice_name=req_params["slice_name"],
                datasource_id=3,
                datasource_type="table",
                datasource_name="birth_names",
                viz_type="api_table",
                params=json.dumps(params),
                owners=[g.user] if g.user else [],
            )

            target = (
                db.session.query(Slice)
                .filter_by(viz_type="api_table")
                .filter(Slice.params.contains(req_params["params"]))
                .first()
            )
            session = db.session()
            if target:
                if target.slice_name != slc.slice_name or target.params != slc.params:
                    target.slice_name = slc.slice_name
                    target.params = slc.params
                    session.commit()
                    return json.dumps({"msg": "Slice Modifed"})
                else:
                    return json.dumps({"msg": "Slice Unchanged"})
            else:
                session.add(slc)
                session.commit()
                return json.dumps({"msg": "Slice Added"})
        else:
            slcs = db.session.query(Slice).filter_by(viz_type="api_table").all()
            return json.dumps(list(map(lambda x: {str(x): x.json_data}, slcs)))
