# pylint: disable=R
import json

from flask import g, jsonify, request
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access_api
import grpc
from nameko.standalone.rpc import ClusterRpcProxy
import requests

from superset import appbuilder, conf, db, security_manager
from superset.common.query_context import QueryContext
import superset.models.core as models
from superset.models.core import Log
from superset.utils import sachima_pb2, sachima_pb2_grpc
from .base import api, BaseSupersetView, data_payload_response, handle_api_exception


class Api(BaseSupersetView):
    @Log.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose('/v1/query/', methods=['POST'])
    def query(self):
        """
        Takes a query_obj constructed in the client and returns payload data response
        for the given query_obj.
        """
        query_context = QueryContext(**json.loads(request.form.get('query_context')))
        security_manager.assert_datasource_permission(query_context.datasource, g.user)
        payload_json = query_context.get_data()
        return data_payload_response(payload_json)


appbuilder.add_view_no_menu(Api)


class Sachima(BaseSupersetView):
    @Log.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose('/v1/restful/', methods=['POST'])
    def restful(self):
        """
        RESTFul API
        """
        req_params = request.get_json()
        res = requests.post(
            conf.get('API_URL_CONFIG').get('RESTFUL'),
            json=req_params,
            timeout=300,
        )
        result = json.loads(res.text)
        return jsonify(result), 201

    @Log.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose('/v1/rpc/', methods=['POST'])
    def rpc(self):
        """
        Nameko RPC
        """
        req_params = request.get_json()
        CONFIG = {'AMQP_URI': conf.get('API_URL_CONFIG').get('RPC')}
        with ClusterRpcProxy(CONFIG) as rpc:
            res = rpc.data.get_report(req_params)
        result = res
        return jsonify(result), 201

    @Log.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose('/v1/grpc/', methods=['POST'])
    def grpc(self):
        # NOTE(gRPC Python Team): .close() is possible on a channel and should be
        # used in circumstances in which the with statement does not fit the needs
        # of the code.
        req_params = request.get_json()
        with grpc.insecure_channel(conf.get('API_URL_CONFIG').get('GRPC')) as channel:
            stub = sachima_pb2_grpc.ReporterStub(channel)
            response = stub.RunReport(
                sachima_pb2.ReportRequest(params=req_params))
        result = json.loads(response.message)
        return jsonify(result), 201

    @Log.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose('/v1/save_or_overwrite_slice/', methods=['GET', 'POST'])
    def save_or_overwrite_slice(self):
        """
        modified from views/core: Save or overwrite a slice
        """
        if request.method == 'POST':
            req_params = request.get_json()
            params = {
                'external_api_service': req_params.get('api', 'rpc'),
                'external_api_param': req_params.get('params', ''),
            }
            slc = models.Slice(
                slice_name=req_params['slice_name'],
                datasource_id=3,
                datasource_type='table',
                datasource_name='birth_names',
                viz_type='api_table',
                params=json.dumps(params),
                owners=[g.user] if g.user else [],
            )

            target = db.session.query(models.Slice).filter_by(
                viz_type='api_table').filter(
                    models.Slice.params.contains(req_params['params'])).first()
            session = db.session()
            if target:
                if target.slice_name != slc.slice_name or target.params != slc.params:
                    target.slice_name = slc.slice_name
                    target.params = slc.params
                    session.commit()
                    return jsonify({'msg': 'Slice Modifed'})
                else:
                    return jsonify({'msg': 'Slice Unchanged'})
            else:
                session.add(slc)
                session.commit()
                return jsonify({'msg': 'Slice Added'})
        else:
            slcs = db.session.query(models.Slice).filter_by(
                viz_type='api_table').all()
            return jsonify(list(map(lambda x: {str(x): x.json_data}, slcs)))


appbuilder.add_view_no_menu(Sachima)
