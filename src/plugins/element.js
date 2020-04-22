import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Container, Header, Aside, Main, Menu, Submenu, MenuItem, MenuItemGroup, Breadcrumb, BreadcrumbItem, Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox, Tag, Tree, Select, Option } from 'element-ui'

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

// 状态按钮
Vue.use(Switch)

// 分页展示
Vue.use(Pagination)

// 消息弹框
Vue.use(Dialog)

Vue.use(Tag)

// 树形控件
Vue.use(Tree)

// 下拉菜单
Vue.use(Select).use(Option)
