<template>
  <el-main class="main-container">
    <el-card shadow="never" class="content-card">
      <el-form :model="searchParm" :inline="true" size="default" class="search-form">
        <el-form-item>
          <el-input
            placeholder="输入姓名"
            v-model="searchParm.nickName"
            @input="searchParm.nickName = searchParm.nickName.replace(/\d/g, '')"
            class="search-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            placeholder="输入电话"
            v-model="searchParm.phone"
            @input="searchParm.phone = searchParm.phone.replace(/\D/g, '').substring(0, 11)"
            class="search-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="custom-btn btn-query" icon="Search" @click="searchBtn">查询</el-button>
          <el-button
            v-if="global.$hasPerm(['sys:user:add'])"
            class="custom-btn btn-create"
            icon="Plus"
            @click="addBtn"
            >创建</el-button
          >
        </el-form-item>
      </el-form>

      <el-table :height="tableHeight" :data="tableList" border stripe class="data-table">
        <el-table-column align="center" label="照片" prop="image">
          <template #default="scope">
            <el-image
              v-if="scope.row.image"
              style="width: 60px; height: 60px; border-radius: 50%"
              :src="imgbase + scope.row.image.split(',')[0]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="nickName" label="姓名"></el-table-column>
        <el-table-column prop="deptName" label="科室"></el-table-column>
        <el-table-column prop="sex" label="性别">
          <template #default="scope">
            <el-tag
              v-if="scope.row.sex == '0'"
              type="primary"
              size="default"
              effect="light"
              >男</el-tag
            >
            <el-tag
              v-if="scope.row.sex == '1'"
              type="danger"
              size="default"
              effect="light"
              >女</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="visitAddress" label="出诊室"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="sex" label="移动端">
          <template #default="scope">
            <el-tag
              v-if="scope.row.toHome == '0'"
              type="warning"
              size="default"
              effect="light"
              >未</el-tag
            >
            <el-tag
              v-if="scope.row.toHome == '1'"
              type="primary"
              size="default"
              effect="light"
              >已</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="在职">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              :active-value="true"
              :inactive-value="false"
              :before-change="beforeStatus.bind(global, scope.row)"
              @change="changStatus(scope.row.userId)"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            global.$hasPerm([
              'sys:user:edit',
              'sys:user:reset',
              'sys:user:delete',
            ])
          "
          align="center"
          width="340"
          label="操作"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                v-if="global.$hasPerm(['sys:user:edit'])"
                class="custom-btn btn-edit"
                icon="Edit"
                size="default"
                @click="editBtn(scope.row)"
                >修改</el-button
              >
              <el-button
                v-if="global.$hasPerm(['sys:user:reset'])"
                class="custom-btn btn-reset"
                icon="Setting"
                size="default"
                @click="resetPasswordBtn(scope.row.userId)"
                >重置密码</el-button
              >
              <el-button
                v-if="global.$hasPerm(['sys:user:delete'])"
                class="custom-btn btn-delete"
                icon="Delete"
                size="default"
                @click="deleteBtn(scope.row.userId)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="searchParm.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]"
          :page-size="searchParm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchParm.total"
          background
        >
        </el-pagination>
      </div>
    </el-card>

    <SysDialog
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @on-close="onClose"
      @on-confirm="commit"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addForm"
          :rules="rules"
          label-width="100px"
          :inline="false"
          size="default"
        >
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="nickName" label="姓名：">
                <el-input v-model="addModel.nickName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="sex" label="性别：">
                <el-radio-group v-model="addModel.sex">
                  <el-radio :label="'0'">男</el-radio>
                  <el-radio :label="'1'">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="education" label="学历：">
                <el-input v-model="addModel.education"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="jobTitle" label="职称：">
                <el-input v-model="addModel.jobTitle"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="phone" label="电话：">
                <el-input v-model="addModel.phone"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="email" label="邮箱：">
                <el-input v-model="addModel.email"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="roleId" label="角色：">
                <SelectChecked
                  ref="selectRef"
                  :options="options"
                  :bindValue="bindValue"
                  @selected="selected"
                ></SelectChecked>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="科室：" prop="deptId">
                <el-select
                  style="width: 100%"
                  v-model="addModel.deptId"
                  clearable
                  placeholder="选择科室"
                >
                  <el-option
                    v-for="item in deptOptions"
                    :key="item['value']"
                    :label="item['label']"
                    :value="item['value']"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="tags == '0'">
            <el-col :span="12" :offset="0">
              <el-form-item prop="username" label="用户名：">
                <el-input v-model="addModel.username"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="password" label="密码：">
                <el-input
                  type="password"
                  v-model="addModel.password"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="price" label="挂号费：">
                <el-input type="number" v-model.number="addModel.price"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="toHome" label="数据中台：">
                <el-radio-group v-model="addModel.toHome">
                  <el-radio :label="'0'">否</el-radio>
                  <el-radio :label="'1'">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="introduction" label="简介：">
            <el-input
              :rows="3"
              type="textarea"
              v-model="addModel.introduction"
            ></el-input>
          </el-form-item>
          <el-form-item prop="goodAt" label="专业：">
            <el-input
              :rows="3"
              type="textarea"
              v-model="addModel.goodAt"
            ></el-input>
          </el-form-item>
          <el-form-item prop="visitAddress" label="出诊室：">
            <el-input
              :rows="3"
              type="textarea"
              v-model="addModel.visitAddress"
            ></el-input>
          </el-form-item>
          <el-form-item prop="image" label="照片：">
            <UploadImage
              ref="upImgRef"
              @getImg="getImg"
              :oldUrl="oldUrl"
              :fileList="fileList"
            ></UploadImage>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
  </el-main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import UploadImage from "@/components/UploadImage.vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import SelectChecked from "@/components/SelectChecked.vue";
import { getSelectApi } from "@/api/role/index";
import { getSelectDeptApi } from "@/api/department/index";
import { NewType } from "@/type/BaseType";
import {
  addApi,
  getListApi,
  getRoleListApi,
  editApi,
  deleteApi,
  resetPasswordApi,
  enabledApi,
} from "@/api/user/index";
import { User } from "@/api/user/UserModel";
import useInstance from "@/hooks/useInstance";

const { global } = useInstance();
const imgbase = computed(() => {
  return process.env.BASE_API_IMG;
});
const selectRef = ref();
//下拉数据
let options = ref([]);
//表单ref属性
const addForm = ref<FormInstance>();
//弹框属性
const { dialog, onClose, onShow } = useDialog();
//查询栏绑定对象
const searchParm = reactive({
  phone: "",
  nickName: "",
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const deptOptions = ref([]);
//查询科室下拉数据
const getSelectDept = async () => {
  let res = await getSelectDeptApi();
  if (res && res.code == 200) {
    deptOptions.value = res.data;
  }
};
//创建绑定对象
const addModel = reactive({
  userId: "",
  username: "",
  password: "",
  phone: "",
  email: "",
  sex: "",
  nickName: "",
  roleId: "",
  deptId: "",
  deptName: "",
  education: "",
  jobTitle: "",
  image: "",
  introduction: "",
  visitAddress: "",
  toHome: "0",
  goodAt: "",
  price: "",
});

// ---------- 新增和修改的验证规则部分 ----------

// 自定义手机号验证器
const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("请输入电话号码"));
  }
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(value)) {
    callback(new Error("请输入有效的11位手机号码"));
  } else {
    callback();
  }
};

// 自定义挂号费验证器
const validatePrice = (rule: any, value: any, callback: any) => {
  if (value === "" || value === undefined || value === null) {
    return callback(new Error("请输入挂号费"));
  }
  if (typeof value !== 'number' || value <= 0) {
    return callback(new Error("挂号费必须是大于0的数字"));
  }
  callback();
};

//表单验证规则
const rules = reactive({
  nickName: [
    { required: true, message: "请输入姓名", trigger: "blur" },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,10}$/, message: '姓名必须是2-10个中英文字符', trigger: 'blur' }
  ],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  education: [{ required: true, message: "请输入学历", trigger: "blur" }],
  jobTitle: [{ required: true, message: "请输入职称", trigger: "blur" }],
  phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
  email: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }],
  price: [{ required: true, validator: validatePrice, trigger: "blur" }],
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_-]{4,16}$/, message: '用户名必须是4-16位的字母、数字、下划线或减号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,18}$/, message: '密码必须是6-18位，且同时包含字母和数字', trigger: 'blur' }
  ],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
  deptId: [{ required: true, message: "请选择科室", trigger: "change" }],
  image: [{ required: true, message: "请上传照片", trigger: "change" }],
  introduction: [
    { required: true, message: "请填写医生简介", trigger: "blur" },
    { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
  ],
  goodAt: [
    { required: true, message: "请填写医生擅长的病症", trigger: "blur" },
    { max: 200, message: '专业描述不能超过200个字符', trigger: 'blur' }
  ],
  visitAddress: [
    { required: true, message: "请填写出诊室", trigger: "blur" },
    { max: 100, message: '出诊室信息不能超过100个字符', trigger: 'blur' }
  ],
});


//图片上传的ref属性
const upImgRef = ref();
//图片初始值
const fileList = ref<Array<UploadUserFile>>([]);
//回显的图片
const oldUrl = ref<Array<{ url: string }>>([]);
//图片地址
const imgUrl = ref<Array<{ url:string }>>([]);
//子组件调用父组件的方法
const getImg = (img: NewType) => {
  console.log("111111");
  console.log(img);
  //处理图片路径
  imgUrl.value = oldUrl.value.concat(img.newImgUrl);
  if (img.deleteUrl.length > 0) {
    //过滤掉删除的图片路径
    let newArr = imgUrl.value.filter(
      (x) => !img.deleteUrl.some((item) => x.url === item.url)
    );
    imgUrl.value = newArr;
  }
  //组装为逗号分隔的字符串
  let url = "";
  for (let k = 0; k < imgUrl.value.length; k++) {
    url = url + imgUrl.value[k].url + ",";
  }
  //去掉末尾逗号
  addModel.image = url.substring(0, url.lastIndexOf(","));
};

//查询角色下拉数据
const getSelect = async () => {
  let res = await getSelectApi();
  if (res && res.code == 200) {
    options.value = [];
    options.value = res.data;
  }
};
//用户拥有的角色id
const bindValue = ref([]);
const roleIds = ref("");
//根据用户id查询角色
const getRoleList = async (userId: string) => {
  let res = await getRoleListApi(userId);
  if (res && res.code == 200) {
    bindValue.value = res.data;
    console.log(res.data);
    roleIds.value = res.data.join(",");
    console.log(roleIds.value);
  }
};
const tags = ref("");
//创建按钮
const addBtn = async () => {
  //清空图片数据
  fileList.value = [];
  oldUrl.value = [];
  tags.value = "0";
  dialog.title = "创建";
  dialog.height = 400;
  dialog.width = 900;
  await getSelectDept();
  //显示弹框
  onShow();
  //清空下拉数据
  options.value = [];
  bindValue.value = [];
  //获取下拉数据
  await getSelect();

  nextTick(() => {
    //清空下拉数据
    selectRef.value.clear();
  });
  //清空表单
  addForm.value?.resetFields();
};

//修改
const editBtn = async (row: User) => {
  //清空图片数据
  fileList.value = [];
  oldUrl.value = [];
  tags.value = "1";
  dialog.title = "修改";
  dialog.height = 400;
  dialog.width = 900;
  await getSelectDept();
  //清空下拉数据
  options.value = [];
  bindValue.value = [];
  //获取下拉数据
  await getSelect();
  //查询角色Id
  await getRoleList(row.userId);
  //显示弹框
  onShow();
  nextTick(() => {
    //数据回显
    Object.assign(addModel, row);
    //显示角色的id
    addModel.roleId = roleIds.value;
    addModel.password = "";
    //图片回显
    if (addModel.image) {
      //逗号分隔的字符串转为数组
      let imgs = addModel.image.split(",");
      for (let i = 0; i < imgs.length; i++) {
        let img = { name: "", url: "" };
        img.name = imgs[i];
        img.url = process.env.BASE_API_IMG + imgs[i];
        fileList.value.push(img);
        oldUrl.value.push({ url: imgs[i] });
      }
    }
  });

  //清空表单
  addForm.value?.resetFields();
};
//删除
const deleteBtn = async (userId: string) => {
  console.log(userId);
  const confirm = await global.$myconfirm("确定删除该数据吗?");
  if (confirm) {
    let res = await deleteApi(userId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};
//重置密码
const resetPasswordBtn = async (userId: string) => {
  const confirm = await global.$myconfirm("重置之后密码是666666");
  if (confirm) {
    let res = await resetPasswordApi({ userId: userId });
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};
//勾选的值
const selected = (value: Array<string | number>) => {
  console.log(value);
  addModel.roleId = value.join(",");
  console.log(addModel);
};
//提交表单
const commit = () => {
  //验证表单
  addForm.value?.validate(async (valid) => {
    console.log(addModel);
    if (valid) {
      let res = null;
      if (tags.value == "0") {
        res = await addApi(addModel);
      } else {
        res = await editApi(addModel);
      }
      if (res && res.code == 200) {
        ElMessage.success(res.msg);
        upImgRef.value.clearimg();
        getList();
        onClose();
      }
    }
  });
};
//表格数据
const tableList = ref([]);
//查询表格数据
const getList = async () => {
  let res = await getListApi(searchParm);
  if (res && res.code == 200) {
    tableList.value = res.data.records;
    searchParm.total = res.data.total;
  }
};
//页容量改变时触发
const sizeChange = (size: number) => {
  searchParm.pageSize = size;
  getList();
};
//页数改变时触发
const currentChange = (page: number) => {
  searchParm.currentPage = page;
  getList();
};
//表格高度
const tableHeight = ref(0);
//查询按钮点击事件
const searchBtn = () => {
  getList();
};
//重置按钮点击事件
const resetBtn = () => {
  searchParm.nickName = "";
  searchParm.phone = "";
  searchParm.currentPage = 1;
  getList();
};
//开关按钮
// 判断是否在点击弹窗确认按钮时才调用接口
const switchTags = ref("");
const switchParm = reactive({
  userId: "",
  enabled: false,
});
// before方法加一个弹窗提示是否操作
const beforeStatus = async (row: any) => {
  console.log(row);
  const confirm = await global.$confirm(
    row.enabled ? "确定停用该用户吗?" : "确定启用该用户吗?"
  );
  return new Promise((resolve, reject) => {
    if (confirm) {
      // 点击确认按钮时显示switchTags值
      switchTags.value = "confirm";
      switchParm.userId = row.userId;
      switchParm.enabled = !row.enabled;
      console.log(switchParm);
      return resolve(confirm);
    } else {
      return reject(confirm);
    }
  });
};

const changStatus = async (userId: string) => {
  console.log("进入了");
  console.log(switchTags.value);
  // 判断tags值 这样就不会进页面时调用了
  if (switchTags.value == "confirm") {
    console.log("确定禁用");
    console.log(userId);
    try {
      let res = await enabledApi(switchParm);
      if (res && res.code == 200) {
        getList();
        ElMessage.success(res.msg);
      }
    } catch {
      getList();
    }
  }
};

onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 260; // 调整高度以适应新布局
  });
});
</script>

<style scoped>
.main-container {
  background-color: #f0f2f5;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.content-card {
  border-radius: 8px;
  border: none;
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-input {
  width: 220px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #409eff;
}

.custom-btn {
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 8px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.custom-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-btn .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

.btn-query {
  background: linear-gradient(45deg, #2196f3 30%, #4db6ac 90%);
}

.btn-create {
  background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
}

.btn-edit {
  background: linear-gradient(45deg, #67c23a 30%, #85ce61 90%);
}

.btn-reset {
  background: linear-gradient(45deg, #909399 30%, #b0b3b8 90%);
}

.btn-delete {
  background: linear-gradient(45deg, #f44336 30%, #e57373 90%);
}

.data-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.data-table th.el-table__cell) {
  background-color: #fafafa !important;
  color: #333;
  font-weight: 600;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #ecf5ff !important;
}

.pagination-container {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>