<template>
  <div class="login-container">
    <el-form
      class="login-form"
      :model="loginModel"
      ref="form"
      :rules="rules"
      size="large"
    >
      <div class="login-title">BJTU智慧校医服务系统</div>
      <el-form-item prop="username">
        <el-input
          placeholder="输入用户名"
          v-model="loginModel.username"
          prefix-icon="User"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          placeholder="输入密码"
          v-model="loginModel.password"
          show-password
          prefix-icon="Lock"
        ></el-input>
      </el-form-item>
      <el-form-item prop="code">
        <div class="code-input-group">
          <el-input
            placeholder="输入验证码"
            v-model="loginModel.code"
            prefix-icon="CircleCheck"
            class="code-input"
          ></el-input>
          <img class="captcha-image" @click="getImg" :src="imgsrc" alt="验证码" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="commit" class="login-button" type="primary">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { getImgApi, loginApi } from "@/api/user/index";
import { userSotre } from "@/store/user/index";
import { useRouter } from "vue-router";
const router = useRouter();
const store = userSotre();
//表单ref属性
const form = ref<FormInstance>();
//表单绑定对象
const loginModel = reactive({
  username: "admin",
  password: "123456",
  code: "",
});
//表单验证规则
const rules = reactive({
  username: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "输入用户名",
    },
  ],
  password: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "输入密码",
    },
  ],
  code: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "输入验证码",
    },
  ],
});
const imgsrc = ref("");
//获取验证码
const getImg = async () => {
  let res = await getImgApi();
  if (res && res.code == 200) {
    imgsrc.value = res.data;
  }
};
//登录提交
const commit = () => {
  form.value?.validate(async (valid) => {
    if (valid) {
      let res = await loginApi(loginModel);
      if (res && res.code == 200) {
        //存储用户信息
        store.setUserId(res.data.userId);
        store.setNickName(res.data.nickName);
        store.setToken(res.data.token);
        store.setType(res.data.type);
        //跳转数据中台
        router.push({ path: "/" });
      }
    }
  });
};
onMounted(() => {
  getImg();
});
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #05f9f1;
  background-image: url("../../assets/login.png");
  background-size: cover;
  background-position: center;
}

.login-form {
  width: 400px;
  padding: 40px;
  background-color: #16e8ef;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(8, 236, 229, 0.89);
  box-sizing: border-box;
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.code-input-group {
  display: flex;
  align-items: center;
}

.captcha-image {
  height: 40px;
  width: 120px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.login-button {
  width: 100%;
}
</style>