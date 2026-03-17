import React,{useEffect,useState} from "react";
import {
Tabs,Table,Button,Modal,Form,Input,
InputNumber,Select,DatePicker,TimePicker,
message,Rate,Card,Row,Col,Statistic
} from "antd";

import moment from "moment";
import {history} from "umi";

import {saveData,loadData} from "@/utils/storage";

const {TabPane}=Tabs;
const {Option}=Select;

export default ()=>{

const role = localStorage.getItem("role");

const [nhanVien,setNhanVien]=useState<any[]>([]);
const [dichVu,setDichVu]=useState<any[]>([]);
const [lichHen,setLichHen]=useState<any[]>([]);
const [danhGia,setDanhGia]=useState<any[]>([]);

const [form]=Form.useForm();

const [openNV,setOpenNV]=useState(false);
const [openDV,setOpenDV]=useState(false);
const [openLH,setOpenLH]=useState(false);
const [openDG,setOpenDG]=useState(false);

const [current,setCurrent]=useState<any>();

useEffect(()=>{

const r = localStorage.getItem("role");

if(!r){
history.push("/login");
}

setNhanVien(loadData("nhanVien"));
setDichVu(loadData("dichVu"));
setLichHen(loadData("lichHen"));
setDanhGia(loadData("danhGia"));

},[]);

useEffect(()=>saveData("nhanVien",nhanVien),[nhanVien]);
useEffect(()=>saveData("dichVu",dichVu),[dichVu]);
useEffect(()=>saveData("lichHen",lichHen),[lichHen]);
useEffect(()=>saveData("danhGia",danhGia),[danhGia]);

const logout=()=>{
localStorage.removeItem("role");
history.push("/login");
};

const addNhanVien=(v:any)=>{

const data={
id:Date.now(),
...v
};

setNhanVien([...nhanVien,data]);

setOpenNV(false);

form.resetFields();

};

const addDichVu=(v:any)=>{

const data={
id:Date.now(),
...v
};

setDichVu([...dichVu,data]);

setOpenDV(false);

form.resetFields();

};

const datLich=(v:any)=>{

const ngay=v.ngay.format("YYYY-MM-DD");
const gio=v.gio.format("HH:mm");

const trung=lichHen.find(i=>

i.nhanVienId===v.nhanVienId &&
i.ngay===ngay &&
i.gio===gio

);

if(trung){
message.error("Trùng lịch");
return;
}

const data={
id:Date.now(),
...v,
ngay,
gio,
trangThai:"CHO_DUYET"
};

setLichHen([...lichHen,data]);

setOpenLH(false);

};

const updateTrangThai=(id:number,status:string)=>{

setLichHen(
lichHen.map(i=>
i.id===id?{...i,trangThai:status}:i
)
);

};

const addDanhGia=(v:any)=>{

const data={
id:Date.now(),
nhanVienId:current.nhanVienId,
...v
};

setDanhGia([...danhGia,data]);

setOpenDG(false);

};

const doanhThu = lichHen
.filter(i=>i.trangThai==="HOAN_THANH")
.reduce((s,item)=>{

const dv=dichVu.find(d=>d.id===item.dichVuId);

return s+(dv?.gia||0);

},0);

return(

<div style={{padding:20}}>

<Row justify="space-between">

<h2>Booking Service System</h2>

<Button onClick={logout}>Logout</Button>

</Row>

<Tabs defaultActiveKey="1">

<TabPane tab="Dashboard" key="1">

<Row gutter={16}>

<Col span={6}>
<Card>
<Statistic title="Nhân viên" value={nhanVien.length}/>
</Card>
</Col>

<Col span={6}>
<Card>
<Statistic title="Dịch vụ" value={dichVu.length}/>
</Card>
</Col>

<Col span={6}>
<Card>
<Statistic title="Lịch hẹn" value={lichHen.length}/>
</Card>
</Col>

<Col span={6}>
<Card>
<Statistic title="Doanh thu" value={doanhThu}/>
</Card>
</Col>

</Row>

</TabPane>

</Tabs>

</div>

);

}