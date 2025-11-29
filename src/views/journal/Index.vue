<template>
  <el-main class="beautified-main">
    <div class="content-card">
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item>
          <el-input
            v-model="searchParm.keywords"
            placeholder="输入关键字查询"
            class="custom-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
          <el-button
            v-if="global.$hasPerm(['sys:news:add'])"
            type="primary"
            icon="Plus"
            @click="addBtn"
            class="create-btn"
            >创建</el-button
          >
        </el-form-item>
      </el-form>

      <el-table :height="tableHeight" :data="tableList" border stripe class="custom-table">
        <el-table-column prop="image" label="新闻图片" width="150">
          <template #default="scope">
            <el-image
              class="table-image"
              :src="imgbase + scope.row.image.split(',')[0]"
              fit="contain" 
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="新闻主题"></el-table-column>
        <el-table-column prop="textDesc" label="新闻简介"></el-table-column>
        <el-table-column prop="toIndex" label="患者端公布" align="center" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.toIndex == '0'" type="danger" size="default" effect="light" round>
              否
            </el-tag>
            <el-tag v-if="scope.row.toIndex == '1'" type="success" size="default" effect="light" round>
              是
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:news:edit', 'sys:news:delete'])"
          label="操作"
          align="center"
          width="220"
        >
          <template #default="scope">
            <el-button
              v-if="global.$hasPerm(['sys:news:edit'])"
              type="warning"
              icon="Edit"
              size="default"
              circle
              @click="editBtn(scope.row)"
            ></el-button>
            <el-button
              v-if="global.$hasPerm(['sys:news:delete'])"
              type="danger"
              icon="Delete"
              size="default"
              circle
              plain
              @click="deleteBtn(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="custom-pagination"
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

    <SysDialog
      class="dialog-beautify"
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @onClose="onClose"
      @onConfirm="commit"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addRef"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="default"
        >
          <el-form-item prop="title" label="主题">
            <el-input v-model="addModel.title"></el-input>
          </el-form-item>
          <el-form-item prop="textDesc" label="简介">
            <el-input v-model="addModel.textDesc"></el-input>
          </el-form-item>
          <el-form-item prop="image" label="图片：">
            <UploadImage
              ref="upImgRef"
              @getImg="getImg"
              :oldUrl="oldUrl"
              :fileList="fileList"
            ></UploadImage>
          </el-form-item>
          <el-form-item prop="toIndex" label="是否公布">
            <el-radio-group v-model="addModel.toIndex">
              <el-radio :label="'0'">否</el-radio>
              <el-radio :label="'1'">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="textContent" label="新闻详情">
            <div v-if="dialog.visible" class="editor-container">
              <Toolbar
                style="border-bottom: 1px solid #e0e6ed"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 300px; overflow-y: hidden"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
  </el-main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, nextTick } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import { ElMessage, UploadUserFile } from "element-plus";
import useInstance from "@/hooks/useInstance";
import UploadImage from "@/components/UploadImage.vue";
import { NewType } from "@/type/BaseType";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import useEditor from "@/hooks/useEditor";
import { addApi, getListApi, News, editApi, deleteApi } from "@/api/news/index";

const { global } = useInstance();

const imgbase = computed(() => {
  return process.env.BASE_API_IMG;
});

//表单ref属性
const addRef = ref();
//弹框属性
const { dialog, onClose, onShow } = useDialog();
//文本修改器
const {
  editorRef,
  handleCreated,
  mode,
  editorConfig,
  valueHtml,
  toolbarConfig,
} = useEditor();
//查询参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  keywords: "",
  total: 0,
});
//表单验证规则
const rules = reactive({
  title: [
    { required: true, message: "主题不能为空", trigger: ["blur", "change"] },
  ],
  textDesc: [
    { required: true, message: "简介不能为空", trigger: ["blur", "change"] },
  ],
  image: [
    { required: true, message: "上传图片", trigger: ["blur", "change"] },
  ],
  textContent: [
    { required: true, message: "内容不能为空", trigger: ["blur", "change"] },
  ],
});
//表单绑定的对象
const addModel = reactive({
  id: "",
  title: "",
  textDesc: "",
  textContent: "",
  createTime: "",
  image: "",
  toIndex: "",
});

//图片上传的ref属性
const upImgRef = ref();
//图片初始值
const fileList = ref<Array<UploadUserFile>>([]);
//回显的图片
const oldUrl = ref<Array<{ url: string }>>([]);
//图片地址
const imgUrl = ref<Array<{ url: string }>>([]);
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

//查询按钮
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};
const tags = ref("");
//创建按钮
const addBtn = () => {
  tags.value = "0";
  addModel.id = "";
  //清空图片数据
  fileList.value = [];
  oldUrl.value = [];
  valueHtml.value = "";
  //显示弹框属性
  dialog.title = "创建新闻";
  dialog.width = 800;
  dialog.height = 400;
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//重置按钮
const resetBtn = () => {
  searchParm.keywords = "";
  searchParm.currentPage = 1;
  getList();
};
//修改
const editBtn = (row: News) => {
  tags.value = "1";
  addModel.id = "";
  //清空图片数据
  fileList.value = [];
  oldUrl.value = [];
  valueHtml.value = "";
  //显示弹框属性
  dialog.title = "修改新闻";
  dialog.width = 800;
  dialog.height = 400;
  //回显数据
  nextTick(() => {
    Object.assign(addModel, row);
    //显示文本修改器的内容
    valueHtml.value = addModel.textContent;
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
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//删除
const deleteBtn = async (row: News) => {
  let confirm = await global.$myconfirm("确定删除该数据吗?");
  if (confirm) {
    let res = await deleteApi(row.id);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};
//表单提交
const commit = () => {
  //详情
  addModel.textContent = valueHtml.value;
  //表单验证
  addRef.value.validate(async (valid: boolean) => {
    if (valid) {
      let res = null;
      if (tags.value == "0") {
        res = await addApi(addModel);
      } else {
        res = await editApi(addModel);
      }
      if (res && res.code == 200) {
        ElMessage.success(res.msg);
        //清空图片
        upImgRef.value.clearimg();
        onClose();
        //刷新表格数据
        getList();
      }
    }
  });
};
//表格高度
const tableHeight = ref(0);
//表格数据
const tableList = ref([]);
//查询列表
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
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 260;
  });
});
</script>

<style lang="scss" scoped>
// 主背景色
.beautified-main {
  background-color: #f0f2f5;
  padding: 20px;
}

// 内容卡片
.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

// 表单和按钮区域
.el-form {
  margin-bottom: 20px;
}

// 自定义输入框
:deep(.custom-input .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s;
  &:focus-within {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    border-color: #409eff;
  }
}

// 通用按钮样式
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// 主色调按钮（查询/创建）
:deep(.el-button--primary) {
  border: none;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.create-btn {
  background: linear-gradient(135deg, #5369f8 0%, #409eff 100%);
}


// 警告按钮（修改）
:deep(.el-button--warning) {
    background-color: #ff9f43;
    border-color: #ff9f43;
    color: white;

    &:hover {
        background-color: #ffa94d;
        border-color: #ffa94d;
    }
}

// 危险按钮（删除）
:deep(.el-button--danger.is-plain) {
    color: #f56c6c;
    border-color: #f56c6c;

    &:hover {
        color: #fff;
        background-color: #f56c6c;
    }
}


// 自定义表格
.custom-table {
  border-radius: 8px;
  overflow: hidden;

  // 表头
  :deep(thead.is-group th.el-table__cell) {
    background-color: #f8f9fa;
    color: #343a40;
    font-weight: 600;
  }
  
  // 表格行
  :deep(.el-table__row) {
    transition: background-color 0.3s;
    &:hover {
      background-color: #f5f7fa !important;
    }
  }

  // 表格单元格
  :deep(td.el-table__cell), :deep(th.el-table__cell) {
    border-bottom: 1px solid #ebeef5;
  }
}

// 表格图片
.table-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  // 【修改点】为图片容器添加背景色
  background-color: #f5f7fa; 
}


// 自定义分页
.custom-pagination {
  margin-top: 24px;
  justify-content: flex-end;
  :deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
    background: #409eff;
    border-radius: 6px;
    &:hover {
        color: #fff;
    }
  }
  :deep(.el-pagination.is-background .el-pager li:not(.disabled)) {
    border-radius: 6px;
    &:hover {
        color: #409eff;
    }
  }
}

// --- 对话框美化样式 ---
.dialog-beautify {
  :deep(.el-dialog) {
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px;
    margin-right: 0;
    // 【修改点】对话框头部使用新的渐变背景色
    background: linear-gradient(to right, #eef4fe, #fdfdff);
    border-bottom: 1px solid #dcdfe6;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    transition: all 0.3s;
    &:focus-within {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      border-color: #409eff;
    }
  }

  // 【新增】美化单选框选中颜色
  :deep(.el-radio__input.is-checked .el-radio__inner) {
      border-color: #3498db;
      background: #3498db;
  }
  :deep(.el-radio__input.is-checked+.el-radio__label) {
      color: #3498db;
  }


  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    // 【修改点】对话框脚部按钮使用新的渐变背景色
    .el-button--primary {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      border: none;
    }
  }
}

// 富文本编辑器容器
.editor-container {
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden; /* 保证子元素的圆角生效 */
  transition: all 0.3s;
  &:hover {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
  }
}
</style>