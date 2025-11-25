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
  background: linear-gradient(135deg, #d4f9ff, #b5f1f4);
  background-image: url("../../assets/login.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(2px);
}

.login-form {
  width: 400px;
  padding: 40px;

  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;

  box-shadow: 0 8px 20px rgba(0, 172, 193, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  box-sizing: border-box;
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #0a3d62;
  margin-bottom: 30px;
  letter-spacing: 1px;
}

.code-input-group {
  display: flex;
  align-items: center;

  input {
    flex: 1;
  }
}

.captcha-image {
  height: 40px;
  width: 120px;
  margin-left: 12px;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 150, 160, 0.2);
  transition: transform 0.2s ease;
}

.captcha-image:hover {
  transform: scale(1.05);
}

.login-button {
  width: 100%;
  margin-top: 10px;

  background-color: #00bcd4 !important; 
  border-color: #00acc1 !important;
  color: #fff !important;
  font-weight: 600;

  transition: 0.2s ease;
}

.login-button:hover {
  background-color: #00acc1 !important;
  border-color: #0097a7 !important;
}

.el-input__inner:focus {
  border-color: #00acc1 !important;
  box-shadow: 0 0 4px rgba(0, 172, 193, 0.3);
}
</style>
