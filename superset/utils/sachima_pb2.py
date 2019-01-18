# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: sachima.proto

from google.protobuf import symbol_database as _symbol_database
from google.protobuf import reflection as _reflection
from google.protobuf import message as _message
from google.protobuf import descriptor as _descriptor
import sys
_b = sys.version_info[0] < 3 and (
    lambda x: x) or (lambda x: x.encode('latin1'))
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


DESCRIPTOR = _descriptor.FileDescriptor(
    name='sachima.proto',
    package='sachima',
    syntax='proto3',
    serialized_options=None,
    serialized_pb=_b('\n\rsachima.proto\x12\x07sachima\"\x1f\n\rReportRequest\x12\x0e\n\x06params\x18\x01 \x01(\t\"\x1e\n\x0bReportReply\x12\x0f\n\x07message\x18\x01 \x01(\t2E\n\x08Reporter\x12\x39\n\tRunReport\x12\x16.sachima.ReportRequest\x1a\x14.sachima.ReportReplyb\x06proto3')
)


_REPORTREQUEST = _descriptor.Descriptor(
    name='ReportRequest',
    full_name='sachima.ReportRequest',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name='params', full_name='sachima.ReportRequest.params', index=0,
            number=1, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=_b("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=26,
    serialized_end=57,
)


_REPORTREPLY = _descriptor.Descriptor(
    name='ReportReply',
    full_name='sachima.ReportReply',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name='message', full_name='sachima.ReportReply.message', index=0,
            number=1, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=_b("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=59,
    serialized_end=89,
)

DESCRIPTOR.message_types_by_name['ReportRequest'] = _REPORTREQUEST
DESCRIPTOR.message_types_by_name['ReportReply'] = _REPORTREPLY
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

ReportRequest = _reflection.GeneratedProtocolMessageType('ReportRequest', (_message.Message,), dict(
    DESCRIPTOR=_REPORTREQUEST,
    __module__='sachima_pb2'
    # @@protoc_insertion_point(class_scope:sachima.ReportRequest)
))
_sym_db.RegisterMessage(ReportRequest)

ReportReply = _reflection.GeneratedProtocolMessageType('ReportReply', (_message.Message,), dict(
    DESCRIPTOR=_REPORTREPLY,
    __module__='sachima_pb2'
    # @@protoc_insertion_point(class_scope:sachima.ReportReply)
))
_sym_db.RegisterMessage(ReportReply)


_REPORTER = _descriptor.ServiceDescriptor(
    name='Reporter',
    full_name='sachima.Reporter',
    file=DESCRIPTOR,
    index=0,
    serialized_options=None,
    serialized_start=91,
    serialized_end=160,
    methods=[
        _descriptor.MethodDescriptor(
            name='RunReport',
            full_name='sachima.Reporter.RunReport',
            index=0,
            containing_service=None,
            input_type=_REPORTREQUEST,
            output_type=_REPORTREPLY,
            serialized_options=None,
        ),
    ])
_sym_db.RegisterServiceDescriptor(_REPORTER)

DESCRIPTOR.services_by_name['Reporter'] = _REPORTER

# @@protoc_insertion_point(module_scope)
