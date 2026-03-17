import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import { history } from "umi";

export default () => {

  const onFinish = (values:any) => {

    const {username,password} = values;

    if(username==="admin" && password==="123"){
      localStorage.setItem("role","admin");
      history.push("/baitap05");
      return;
    }

    if(username==="staff" && password==="123"){
      localStorage.setItem("role","staff");
      history.push("/baitap05");
      return;
    }

    message.error("Sai tài khoản");

  };

  return(

    <div
      style={{
        height:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
      }}
    >

      <Card title="Booking Service Login" style={{width:350}}>

        <Form layout="vertical" onFinish={onFinish}>

          <Form.Item
            name="username"
            label="Username"
            rules={[{required:true}]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{required:true}]}
          >
            <Input.Password/>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Login
          </Button>

        </Form>

      </Card>

    </div>

  )

}