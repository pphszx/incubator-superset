import React from 'react';
import ReactDOM from 'react-dom';
import {
    LocaleProvider, Form, Row, Col, Icon, Input,
    DatePicker, Alert, Table, Select, Button 
} from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

import 'antd/dist/antd.less';
import xlsx from 'xlsx';
import './ApiTable.css';

moment.locale('zh-cn');

const FormItem = Form.Item;
const { Option } = Select;

const Components = {
    'DatePicker': DatePicker,
    'MonthPicker': DatePicker.MonthPicker,
    'RangePicker': DatePicker.RangePicker,
    'WeekPicker': DatePicker.WeekPicker,
    'Select': Select,
}

class ApiTableRaw extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: '',
            dataSource: [],
            controls: [],
            columns: [],
            isError: null,
            loading: false,
            expand: true,
            searchText: '',
        };

        this.fetchData = this.fetchData.bind(this);
        this.setDataSource = this.setDataSource.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.OnReset = this.OnReset.bind(this);
        this.getControls = this.getControls.bind(this);
        this.getAntdColumns = this.getAntdColumns.bind(this);
        this.getAntdDataSource = this.getAntdDataSource.bind(this);
        this.OnToggle = this.OnToggle.bind(this);
        this.OnDownload = this.OnDownload.bind(this);
        this.onTableSearch = this.onTableSearch.bind(this);
        this.onTableReset = this.onTableReset.bind(this);
    }

    componentDidMount() {
        const { externalApiService } = this.props;
        this.props.form.validateFields((err, values) => {
            // console.log('Form值: ', values);
            this.fetchData(externalApiService, values, true);
          });
    }

    fetchData(transferUrl, params, isUpdateControls=false) {
        this.setState({ loading: true });

        const csrfToken = document.getElementById("csrf_token").value;

        // moment类型转化为字符串
        for (let [key, value] of Object.entries(params)) {
            if (moment.isMoment(value)) {
                params[key] = value.format("YYYY-MM-DD HH:mm:ss")
            } else if (value instanceof Array) {
                if (moment.isMoment(value[0])) {
                    params[key] = value.map(item => item.format("YYYY-MM-DD HH:mm:ss"))
                }
            }
        }

        fetch(transferUrl, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "same-origin", // no-cors, cors, *same-origin
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json; charset=utf-8",
                // "Content-Type": "application/x-www-form-urlencoded",
                "Connection": "keep-alive",
                'X-CSRF-TOKEN': csrfToken,
            },
            // redirect: "follow", // manual, *follow, error
            // referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(params), // body data type must match "Content-Type" header
        })
            .then(Response => Response.json())
            .then(result => this.setDataSource(result, isUpdateControls))
            .catch(error => {
                console.log(error);
                this.setState({ isError: error });
            });
    }

    setDataSource(data, isUpdateControls) {
        const { 
            dataSource,
            columns,
            controls,
        } = data;
        if (isUpdateControls) {
            this.setState({
                controls: controls,
                dataSource: dataSource,
                columns: columns,
                loading: false,
            });
        } else {
            this.setState({
                dataSource: dataSource,
                columns: columns,
                loading: false,
            });
        };
        console.log(data);
    }

    onSearchSubmit(event) {
        event.preventDefault();
        const { externalApiService } = this.props;
        this.props.form.validateFields((err, values) => {
            // console.log('Form值: ', values);
            this.fetchData(externalApiService, values);
          });
    }

    OnReset() {
        this.props.form.resetFields();
      }

    OnToggle() {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    }

    OnDownload() {
        const {
            dataSource,
            columns,
        } = this.state;

        /* Generate Workbook */
        let wb = xlsx.utils.book_new();
        let ws = xlsx.utils.json_to_sheet(
            dataSource,
            {header: columns});
        xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

        // let elt = this.antdTable.getElementsByTagName('table')[0]
        // let wb = xlsx.utils.table_to_book(elt, {sheet:"Sheet JS"});

        /* Trigger Download with `writeFile` */
        xlsx.writeFile(wb, `Superset Export ${moment().format("YYYY-MM-DD HH:mm:ss")}.xlsx`, {compression:true});
    }

    onTableSearch(selectedKeys, confirm) {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }
    
    onTableReset(clearFilters) {
        clearFilters();
        this.setState({ searchText: '' });
    }

    getColumnSearchProps(dataIndex) {
        return {
            filterDropdown: ({
                setSelectedKeys, selectedKeys, confirm, clearFilters,
            }) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            ref={node => { this.searchInput = node; }}
                            placeholder={`搜索 ${dataIndex}`}
                            value={selectedKeys[0]}
                            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                            onPressEnter={() => this.onTableSearch(selectedKeys, confirm)}
                            style={{ width: 188, marginBottom: 8, display: 'block' }}
                        />
                        <Button
                            type="primary"
                            onClick={() => this.onTableSearch(selectedKeys, confirm)}
                            icon="search"
                            size="small"
                            style={{ width: 90, marginRight: 8 }}
                        >
                            确定
                        </Button>
                        <Button
                            onClick={() => this.onTableReset(clearFilters)}
                            size="small"
                            style={{ width: 90 }}
                        >
                            重置
                        </Button>
                    </div>
                ),
            filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : false,
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => this.searchInput.select());
                }
            },
        }
    }

    getControls() {
        const {
            controls,
            expand,
        } = this.state;
        let children = [];
        if (controls) {
            const { getFieldDecorator } = this.props.form;
            
            let controls_array = [];
            for (let i=0; i<=controls.length; i=i+3) {
                controls_array.push(controls.slice(i, i+3))
            }

            const count = expand ? controls_array.length : 1;
            
            // 先渲染行，再渲染列
            children = controls_array.map(
                (item_array, index_array) =>
                    <Row gutter={{ md: 8, lg: 24, xl: 48 }}  style={{ display: index_array < count ? 'block' : 'none' }}>
                        {item_array.map(
                            (item, index) => {
                                const CustomTag = Components[`${item.type}`];
                                const CustomLabel = item.label ? item.label : item.id;
                                const options = item.option 
                                    ? item.option.sort(
                                        (opt1, opt2) => (opt1 < opt2) ? -1 : 1).map(
                                            c => <Option value={ c }>{ c }</Option>) 
                                    : null;

                                const props = item.props
                                    ? Object.keys(item.props).filter(s=>s!=='value').reduce((obj, key) => {
                                        obj[key] = item.props[key];
                                        return obj;
                                    }, {})
                                    : null;

                                // 根据类型初始化
                                let value = null;
                                if (item.props) {
                                    const propsAll = Object.keys(item.props);
                                    if (item.type === 'RangePicker') {
                                        props['showTime'] = { defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }
                                        if (propsAll.includes('value') && propsAll.includes('format')) {
                                            value = [moment(item.props.value[0], item.props.format), moment(item.props.value[1], item.props.format)];
                                        };
                                    } else if (['DatePicker', 'MonthPicker', 'WeekPicker'].includes(item.type)) {
                                        props['showTime'] = { defaultValue: moment('00:00:00', 'HH:mm:ss') }
                                        if (propsAll.includes('value') && propsAll.includes('format')) {
                                            value = moment(item.props.value, item.props.format);
                                        };
                                    } else {
                                        if (propsAll.includes('value')) {
                                            value = item.props.value;
                                        }
                                    }
                                };

                                // 应该可以合并
                                return <Col md={8} sm={24} key={index}>
                                    { value
                                    ? <FormItem label={`${CustomLabel}`} style={{ marginBottom: 12 }}>
                                        {getFieldDecorator(`${item.id}`, {initialValue: value})(
                                            <CustomTag
                                                {...props}
                                                // onChange={(...args) => { this.onSearchChange(item, ...args); }}
                                            >
                                                {options}
                                            </CustomTag>
                                        )}
                                    </FormItem>
                                    : <FormItem label={`${CustomLabel}`} style={{ marginBottom: 12 }}>
                                    {getFieldDecorator(`${item.id}`, {})(
                                        <CustomTag
                                            {...props}
                                            // onChange={(...args) => { this.onSearchChange(item, ...args); }}
                                        >
                                            {options}
                                        </CustomTag>
                                    )}
                                    </FormItem>
                                    }
                                </Col>
                            }
                        )}
                    </Row>
            )
        }
        return children;
    }
    
    getAntdColumns(columns) {
        let antdCol = [];
        if (columns) {
            const col_width = parseFloat((1/columns.length*100).toPrecision(12))+"%";
            antdCol = columns.map(
                col => {
                    let colObj = {};
                    colObj["title"] = col;
                    colObj["dataIndex"] = col;
                    colObj["key"] = col;
                    colObj["width"] = col_width;
                    colObj['sorter'] = (opt1, opt2) => (opt1[col] < opt2[col]) ? -1 : 1;
                    Object.assign(colObj, this.getColumnSearchProps(col));
                    return colObj;
                }
            )
        };
        return antdCol;
    }

    getAntdDataSource(dataSource) {
        let andtdDataSource = [];
        if (dataSource) {
            andtdDataSource = dataSource.map(
                (tablerow, index) => Object.assign({}, tablerow, {key: index})
            )
        };
        return andtdDataSource;
    }

    render() {
        const {
            externalApiParam,
        } = this.props;

        const {
            date,
            dataSource,
            columns,
            isError,
            loading,
        } = this.state;

        const {
            getFieldDecorator
        } = this.props.form;

        // 隐藏字段名称为name，和RPC要求一致
        return (
            <LocaleProvider locale={zhCN}>
                <div>
                    <Form
                        layout='vertical'
                        onSubmit={this.onSearchSubmit}
                    >
                        {this.getControls()}
                        <Row>
                            <Col sm={24} style={{ textAlign: 'right' }}>
                                <FormItem style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('name', {
                                        initialValue: externalApiParam,
                                    })(
                                        <Input type="hidden" />
                                    )}
                                </FormItem>
                                <Button type="primary" icon="search" htmlType="submit" disabled={loading}>
                                    查询
                                </Button>
                                <Button icon="delete" style={{ marginLeft: 8 }} onClick={this.OnReset}>
                                    重置
                                </Button>
                                <Button icon="download" style={{ marginLeft: 8 }} disabled={loading} onClick={this.OnDownload}>
                                    下载
                                </Button>
                                <a style={{ marginLeft: 10, fontSize: 14 }} onClick={this.OnToggle}>
                                    {this.state.expand ? '收起' : '展开'}
                                    <Icon type={this.state.expand ? 'up' : 'down'} />
                                </a>
                            </Col>
                        </Row>
                    </Form>
                    {   isError
                        ? <div className="interactions">
                            <Alert message="API调用错误" type="error" />
                        </div>
                        : <div ref={el => this.antdTable = el} style={{ marginTop: 20 }}>
                            <Table
                                dataSource={this.getAntdDataSource(dataSource)}
                                columns={this.getAntdColumns(columns)}
                                loading={loading}
                                bordered={true}
                                scroll={{ x: 360 }}
                                // scroll={true}
                                size='small'
                            />
                        </div>
                    }
                </div>
            </LocaleProvider>
        );
    }
}

const ApiTable = Form.create()(ApiTableRaw);
export default ApiTable;
