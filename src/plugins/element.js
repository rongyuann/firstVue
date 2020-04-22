import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Container, Header, Aside, Main, Menu, Submenu, MenuItem, MenuItemGroup, Breadcrumb, BreadcrumbItem, Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox } from 'element-ui'

Vue.use(Button).use(Tooltip)
// Form表单
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)

// 挂载弹框提示
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

// Container布局容器
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)

// Menu侧边栏菜单
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Submenu)

// Breadcrumb导航
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)

// Layout布局 24
Vue.use(Row).use(Col)

// Table表格
Vue.use(Table).use(TableColumn)

Vue.use(Switch)

Vue.use(Pagination)

Vue.use(Dialog)
