import React from 'react';
import {
  ConfigProvider,
  Form,
  Row,
  Col,
  Input,
  DatePicker,
  Alert,
  Table,
  Select,
  Button,
  Switch,
  Drawer,
} from 'antd';
import {
  BarChartOutlined,
  SearchOutlined,
  CloudDownloadOutlined,
  ToolOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

import 'antd/dist/antd.css';
import xlsx from 'xlsx';
import './ApiTable.css';

import Vis from './vis/Vis';
moment.locale('zh-cn');

const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const { Option } = Select;

const Components = {
  DatePicker,
  MonthPicker: DatePicker.MonthPicker,
  RangePicker: DatePicker.RangePicker,
  WeekPicker: DatePicker.WeekPicker,
  Select,
};

class ApiTable extends React.Component {
  // https://ant.design/components/form-cn/#components-form-demo-control-ref

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
      drawerVisible: false,
      vis: null,
    };

    this.formRef = React.createRef();

    this.getRequest = this.getRequest.bind(this);
    this.getData = this.getData.bind(this);
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
    this.showDrawer = this.showDrawer.bind(this);
    this.onDrawerClose = this.onDrawerClose.bind(this);
  }

  componentDidMount() {
    const { externalApiService } = this.props;
    this.formRef.current.validateFields().then((values) => {
      // console.log('Form值: ', values);
      this.getData(externalApiService, values, true);
    });
  }

  componentDidUpdate(prevProps) {
    const { externalApiParam, externalApiService } = this.props;
    if (prevProps.externalApiParam !== externalApiParam) {
      this.getData(externalApiService, { name: externalApiParam }, true);
    }
  }

  // TODO:考虑二次查询的逻辑
  setDataSource(data, isUpdateControls) {
    const { dataSource, columns, controls, vis } = data;
    // console.log('data', data)
    if (isUpdateControls) {
      const { externalApiService, externalApiParam } = this.props;
      const presetParam = { name: externalApiParam, isForce: false };
      let isPreset = false;
      let requests = this.getRequest();

      for (let i = 0; i < controls.length; i++) {
        // 收集默认值=======
        if ('value' in controls[i].props) {
          isPreset = true;
          Object.assign(presetParam, {
            [controls[i].id]: controls[i].props.value,
          });
        }

        // 根据URL参数和控件类型设置控件值=======
        if (
          // 使用id或者label属性均可
          controls[i].id in requests ||
          (controls[i].label && controls[i].label in requests)
        ) {
          if (controls[i].type === 'Select') {
            // 目前只处理选择器
            if (
              controls[i].props.mode &&
              ['multiple', 'tags'].includes(controls[i].props.mode)
            ) {
              controls[i].props.value = [
                controls[i].id in requests
                  ? requests[controls[i].id]
                  : requests[controls[i].label],
              ];
            } else {
              controls[i].props.value =
                controls[i].id in requests
                  ? requests[controls[i].id]
                  : requests[controls[i].label];
            }
          }
        }
      }

      this.setState({
        controls,
        dataSource,
        columns,
        vis,
        loading: false,
      });

      // 存在默认值则进行二次查询，且不更新控件
      if (isPreset) {
        Object.assign(presetParam, requests);
        this.getData(externalApiService, presetParam);
      }
    } else {
      this.setState({
        dataSource,
        columns,
        vis,
        loading: false,
      });
    }
  }

  showDrawer() {
    this.setState({
      drawerVisible: true,
    });
  }

  onDrawerClose() {
    this.setState({
      drawerVisible: false,
    });
  }

  onSearchSubmit(values) {
    const { externalApiService, externalApiParam } = this.props;
    this.getData(externalApiService, { ...values, name: externalApiParam });
  }

  OnReset() {
    this.formRef.current.resetFields();
  }

  OnToggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  OnDownload() {
    const { dataSource, columns } = this.state;

    /* Generate Workbook */
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(dataSource, {
      header: columns.map((col) => col.title),
    });
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    // const elt = this.antdTable.getElementsByTagName('table')[0]
    // const wb = xlsx.utils.table_to_book(elt, {sheet:"Sheet JS"});

    /* Trigger Download with `writeFile` */
    xlsx.writeFile(
      wb,
      `Superset Export ${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`,
      { compression: true }
    );
  }

  onTableSearch(selectedKeys, confirm) {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  onTableReset(clearFilters) {
    clearFilters();
    this.setState({ searchText: '' });
  }

  getRequest() {
    const url = window.location.search; // 获取url中"?"符后的字串
    let theRequest = {};

    if (url.indexOf('?') !== -1) {
      let str = url.substr(1);
      let strs = str.split('&');
      for (let i = 0; i < strs.length; i++) {
        theRequest[decodeURI(strs[i].split('=')[0])] = decodeURI(
          strs[i].split('=')[1]
        );
      }
    }
    return theRequest;
  }

  getData(transferUrl, params, isUpdateControls = false) {
    this.setState({ loading: true, isError: null });
    // console.log(transferUrl, params, isUpdateControls);
    let csrfToken = document.getElementById('csrf_token');
    csrfToken = csrfToken ? csrfToken.value : '';

    // 更新 URL Param
    Object.assign(params, this.getRequest());

    // moment类型转化为字符串
    for (const [key, value] of Object.entries(params)) {
      if (moment.isMoment(value)) {
        params[key] = value.format('YYYY-MM-DD HH:mm:ss');
      } else if (value instanceof Array) {
        if (moment.isMoment(value[0])) {
          params[key] = value.map((item) => item.format('YYYY-MM-DD HH:mm:ss'));
        }
      }
    }

    fetch(transferUrl, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'same-origin', // no-cors, cors, *same-origin
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
        Connection: 'keep-alive',
        'X-CSRF-TOKEN': csrfToken,
      },
      // redirect: "follow", // manual, *follow, error
      // referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(params), // body data type must match "Content-Type" header
    })
      .then((Response) => Response.json())
      .then((result) => this.setDataSource(result, isUpdateControls))
      .catch((error) => {
        this.setState({ isError: error, loading: false });
      });
  }

  getColumnSearchProps(dataIndex) {
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node;
            }}
            placeholder={`搜索 ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => this.onTableSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type='primary'
            onClick={() => this.onTableSearch(selectedKeys, confirm)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90, marginRight: 8 }}
          >
            确定
          </Button>
          <Button
            onClick={() => this.onTableReset(clearFilters)}
            size='small'
            style={{ width: 90 }}
          >
            重置
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : false,
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => this.searchInput.select());
        }
      },
    };
  }

  getControls() {
    const { controls, expand } = this.state;
    let children = [];
    if (controls) {
      const controlsArray = [];
      for (let i = 0; i <= controls.length; i = i + 3) {
        controlsArray.push(controls.slice(i, i + 3));
      }

      const count = expand ? controlsArray.length : 1;

      // 先渲染行，再渲染列
      children = controlsArray.map((itemArray, indexArray) => (
        <Row
          key={indexArray}
          gutter={{ md: 8, lg: 24, xl: 48 }}
          style={{ display: indexArray < count ? 'flex' : 'none' }}
        >
          {itemArray.map((item, index) => {
            const CustomTag = Components[`${item.type}`];
            const CustomID = item.id;
            const CustomLabel = item.label ? item.label : item.id;
            const options = item.option
              ? item.option
                  .sort((opt1, opt2) => (opt1 < opt2 ? -1 : 1))
                  .map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))
              : null;

            const props = item.props
              ? Object.keys(item.props)
                  .filter((s) => s !== 'value')
                  .reduce((obj, key) => {
                    obj[key] = item.props[key];
                    return obj;
                  }, {})
              : null;

            // 根据类型初始化
            let value = null;
            if (item.props) {
              const propsAll = Object.keys(item.props);
              if (item.type === 'RangePicker') {
                props['showTime'] = {
                  defaultValue: [
                    moment('00:00:00', 'HH:mm:ss'),
                    moment('23:59:59', 'HH:mm:ss'),
                  ],
                };
                if (propsAll.includes('value') && propsAll.includes('format')) {
                  value = [
                    moment(item.props.value[0], item.props.format),
                    moment(item.props.value[1], item.props.format),
                  ];
                }
              } else if (
                ['DatePicker', 'MonthPicker', 'WeekPicker'].includes(item.type)
              ) {
                props['showTime'] = {
                  defaultValue: moment('00:00:00', 'HH:mm:ss'),
                };
                if (propsAll.includes('value') && propsAll.includes('format')) {
                  value = moment(item.props.value, item.props.format);
                }
              } else {
                if (propsAll.includes('value')) {
                  value = item.props.value;
                }
              }
            }

            // https://stackoverflow.com/questions/31163693/how-do-i-conditionally-add-attributes-to-react-components
            return (
              <Col xs={20} sm={16} md={8} key={index}>
                <FormItem
                  name={`${CustomID}`}
                  label={`${CustomLabel}`}
                  {...(value ? { initialValue: value } : {})}
                  // initialValue={value ? value : undefined}
                  style={{ marginBottom: 12 }}
                >
                  <CustomTag
                    {...props}
                    // onChange={(...args) => { this.onSearchChange(item, ...args); }}
                  >
                    {options}
                  </CustomTag>
                </FormItem>
              </Col>
            );
          })}
        </Row>
      ));
    }
    return children;
  }

  getAntdColumns(columns) {
    let antdCol = [];
    if (columns) {
      const colWidth =
        parseFloat(((1 / columns.length) * 100).toPrecision(12)) + '%';

      for (let col of columns) {
        let temp = {};
        temp['dataIndex'] = col['dataIndex'];
        temp['key'] = col['key'];
        temp['title'] = col['title'];
        temp['width'] = colWidth;
        if ('render' in col && 'action' in col['render']) {
          // 自定义format函数
          if (!String.format) {
            String.format = function (format) {
              var args = Array.prototype.slice.call(arguments, 1);
              return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                  ? args[number]
                  : match;
              });
            };
          }
          const url = col.render.action;
          temp['render'] = (text, record, index) => (
            <span>
              <a
                href={String.format(url, text)} // 暂只支持单个变量
                target='_blank'
                rel='noopener noreferrer'
              >{`${text}`}</a>
            </span>
          );
        }
        // TODO：排序和筛选功能需要改进
        temp['sorter'] = (opt1, opt2) => (opt1 < opt2 ? -1 : 1);
        Object.assign(temp, this.getColumnSearchProps(col.dataIndex));
        antdCol.push(temp);
      }
    }
    return antdCol;
  }

  getAntdDataSource(dataSource) {
    let andtdDataSource = [];
    if (dataSource) {
      andtdDataSource = dataSource.map((tablerow, index) =>
        Object.assign({}, tablerow, { key: index })
      );
    }
    return andtdDataSource;
  }

  render() {
    const { externalApiParam } = this.props;

    const { dataSource, columns, isError, loading, vis } = this.state;

    // 隐藏字段名称为name，和RPC要求一致
    return (
      <ConfigProvider locale={zhCN}>
        <div>
          <Form
            layout='vertical'
            ref={this.formRef}
            onFinish={this.onSearchSubmit}
          >
            {this.getControls()}
            <Row>
              <Col sm={24} style={{ textAlign: 'right' }}>
                <FormItem
                  name='name'
                  initialValue={externalApiParam}
                  style={{ marginBottom: 0 }}
                >
                  <Input type='hidden' />
                </FormItem>
                <FormItem
                  name='isForce'
                  initialValue={false}
                  style={{
                    marginBottom: 0,
                    marginRight: 10,
                  }}
                  valuePropName='checked'
                >
                  <Switch checkedChildren='强刷' unCheckedChildren='缓存' />
                </FormItem>
                <ButtonGroup>
                  <Button
                    type='primary'
                    icon={<SearchOutlined />}
                    htmlType='submit'
                    disabled={loading}
                  >
                    查询
                  </Button>
                  <Button icon={<ToolOutlined />} onClick={this.OnReset}>
                    重置
                  </Button>
                  <Button
                    icon={<CloudDownloadOutlined />}
                    disabled={loading}
                    onClick={this.OnDownload}
                  >
                    下载
                  </Button>
                  {vis ? (
                    <Button
                      type='secondary'
                      icon={<BarChartOutlined />}
                      disabled={loading}
                      onClick={this.showDrawer}
                    >
                      可视化
                    </Button>
                  ) : (
                    ''
                  )}
                </ButtonGroup>
                <Button type='link' onClick={this.OnToggle}>
                  {this.state.expand ? '收起' : '展开'}
                  {this.state.expand ? (
                    <CaretUpOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
          {isError ? (
            <div className='interactions'>
              <Alert message='API调用错误' type='error' />
            </div>
          ) : (
            <div
              ref={(el) => (this.antdTable = el)}
              style={{ marginTop: 20, height: '475px', overflowY: 'scroll' }}
            >
              <Table
                dataSource={this.getAntdDataSource(dataSource)}
                columns={this.getAntdColumns(columns)}
                pagination={{
                  pageSizeOptions: [
                    '10',
                    '20',
                    '30',
                    '40',
                    `${dataSource.length}`,
                  ],
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 行`,
                }}
                loading={loading}
                bordered={true}
                scroll={{ x: 360 }}
                // scroll={true}
                size='small'
              />
            </div>
          )}
        </div>
        {vis ? (
          <Drawer
            title={vis.title}
            placement='right'
            forceRender={true}
            width={1659}
            closable={true}
            onClose={this.onDrawerClose}
            visible={this.state.drawerVisible}
            getContainer={true}
            drawerStyle={{ position: 'absolute', backgroundColor: '#393862' }}
            destroyOnClose
          >
            <Vis
              data={dataSource}
              columns={columns}
              type={vis.type}
              title={vis.title}
              params={vis.params}
            />
          </Drawer>
        ) : (
          ''
        )}
      </ConfigProvider>
    );
  }
}

export default ApiTable;
