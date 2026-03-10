import {
  Tabs,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Row,
  Col,
} from "antd";
import { useState } from "react";

const { TabPane } = Tabs;
const { TextArea } = Input;

export default () => {
  const [formKhoi] = Form.useForm();
  const [formMon] = Form.useForm();
  const [formCauHoi] = Form.useForm();
  const [formDe] = Form.useForm();

  const [khoi, setKhoi] = useState<any[]>([]);
  const [monHoc, setMonHoc] = useState<any[]>([]);
  const [cauHoi, setCauHoi] = useState<any[]>([]);
  const [deThi, setDeThi] = useState<any[]>([]);
  const [search, setSearch] = useState<any>({});

  const themKhoi = (values: any) => {
    setKhoi([...khoi, { id: Date.now(), ...values }]);
    formKhoi.resetFields();
  };

  const xoaKhoi = (id: number) => {
    setKhoi(khoi.filter((i) => i.id !== id));
  };

  const themMon = (values: any) => {
    setMonHoc([...monHoc, { id: Date.now(), ...values }]);
    formMon.resetFields();
  };

  const xoaMon = (id: number) => {
    setMonHoc(monHoc.filter((i) => i.id !== id));
  };

  const themCauHoi = (values: any) => {
    setCauHoi([...cauHoi, { id: Date.now(), ...values }]);
    formCauHoi.resetFields();
  };

  const xoaCauHoi = (id: number) => {
    setCauHoi(cauHoi.filter((i) => i.id !== id));
  };

  const cauHoiFilter = cauHoi.filter((c) => {
    return (
      (!search.monHocId || c.monHocId === search.monHocId) &&
      (!search.mucDo || c.mucDo === search.mucDo) &&
      (!search.khoiId || c.khoiId === search.khoiId)
    );
  });

  const taoDeThi = (values: any) => {
    let ketQua: any[] = [];

    for (let ct of values.chiTiet) {
      const ds = cauHoi.filter(
        (c) =>
          c.monHocId === values.monHocId &&
          c.khoiId === ct.khoiId &&
          c.mucDo === ct.mucDo
      );

      if (ds.length < ct.soLuong) {
        message.error("Không đủ câu hỏi để tạo đề");
        return;
      }

      const random = ds.sort(() => 0.5 - Math.random()).slice(0, ct.soLuong);

      ketQua.push(...random);
    }

    const de = {
      id: Date.now(),
      monHocId: values.monHocId,
      danhSach: ketQua,
    };

    setDeThi([...deThi, de]);

    message.success("Tạo đề thành công");
    formDe.resetFields();
  };

  return (
    <Tabs defaultActiveKey="1">

      <TabPane tab="Khối kiến thức" key="1">
        <Form layout="inline" form={formKhoi} onFinish={themKhoi}>
          <Form.Item
            name="tenKhoi"
            rules={[{ required: true, message: "Nhập tên khối" }]}
          >
            <Input placeholder="Tên khối kiến thức" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
        </Form>

        <Table
          style={{ marginTop: 20 }}
          rowKey="id"
          dataSource={khoi}
          columns={[
            { title: "Tên khối", dataIndex: "tenKhoi" },
            {
              title: "Thao tác",
              render: (_, r: any) => (
                <Button danger onClick={() => xoaKhoi(r.id)}>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </TabPane>

      <TabPane tab="Môn học" key="2">
        <Form layout="inline" form={formMon} onFinish={themMon}>
          <Form.Item
            name="maMon"
            rules={[{ required: true, message: "Nhập mã môn" }]}
          >
            <Input placeholder="Mã môn" />
          </Form.Item>

          <Form.Item
            name="tenMon"
            rules={[{ required: true, message: "Tên môn" }]}
          >
            <Input placeholder="Tên môn" />
          </Form.Item>

          <Form.Item name="soTinChi">
            <InputNumber placeholder="Tín chỉ" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
        </Form>

        <Table
          style={{ marginTop: 20 }}
          rowKey="id"
          dataSource={monHoc}
          columns={[
            { title: "Mã môn", dataIndex: "maMon" },
            { title: "Tên môn", dataIndex: "tenMon" },
            { title: "Tín chỉ", dataIndex: "soTinChi" },
            {
              title: "Thao tác",
              render: (_, r: any) => (
                <Button danger onClick={() => xoaMon(r.id)}>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </TabPane>

      <TabPane tab="Câu hỏi" key="3">
        <Form layout="vertical" form={formCauHoi} onFinish={themCauHoi}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="maCauHoi"
                label="Mã câu hỏi"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="monHocId" label="Môn học">
                <Select>
                  {monHoc.map((m) => (
                    <Select.Option key={m.id} value={m.id}>
                      {m.tenMon}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="khoiId" label="Khối kiến thức">
                <Select>
                  {khoi.map((k) => (
                    <Select.Option key={k.id} value={k.id}>
                      {k.tenKhoi}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="mucDo" label="Mức độ">
                <Select>
                  <Select.Option value="Dễ">Dễ</Select.Option>
                  <Select.Option value="Trung bình">
                    Trung bình
                  </Select.Option>
                  <Select.Option value="Khó">Khó</Select.Option>
                  <Select.Option value="Rất khó">
                    Rất khó
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="noiDung" label="Nội dung câu hỏi">
            <TextArea rows={4} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Thêm câu hỏi
          </Button>
        </Form>

        <Card style={{ marginTop: 20 }} title="Tìm kiếm">
          <Row gutter={16}>
            <Col span={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Môn học"
                allowClear
                onChange={(v) => setSearch({ ...search, monHocId: v })}
              >
                {monHoc.map((m) => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.tenMon}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Mức độ"
                allowClear
                onChange={(v) => setSearch({ ...search, mucDo: v })}
              >
                <Select.Option value="Dễ">Dễ</Select.Option>
                <Select.Option value="Trung bình">
                  Trung bình
                </Select.Option>
                <Select.Option value="Khó">Khó</Select.Option>
                <Select.Option value="Rất khó">
                  Rất khó
                </Select.Option>
              </Select>
            </Col>

            <Col span={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Khối kiến thức"
                allowClear
                onChange={(v) => setSearch({ ...search, khoiId: v })}
              >
                {khoi.map((k) => (
                  <Select.Option key={k.id} value={k.id}>
                    {k.tenKhoi}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <Table
          style={{ marginTop: 20 }}
          rowKey="id"
          dataSource={cauHoiFilter}
          columns={[
            { title: "Mã", dataIndex: "maCauHoi" },
            { title: "Nội dung", dataIndex: "noiDung" },
            { title: "Mức độ", dataIndex: "mucDo" },
            {
              title: "Thao tác",
              render: (_, r: any) => (
                <Button danger onClick={() => xoaCauHoi(r.id)}>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </TabPane>

      <TabPane tab="Đề thi" key="4">
        <Form layout="vertical" form={formDe} onFinish={taoDeThi}>
          <Form.Item name="monHocId" label="Môn học">
            <Select>
              {monHoc.map((m) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.tenMon}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="chiTiet">
            {(fields, { add }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={16} key={field.key}>
                    <Col span={6}>
                      <Form.Item
                        name={[field.name, "khoiId"]}
                        label="Khối"
                      >
                        <Select>
                          {khoi.map((k) => (
                            <Select.Option key={k.id} value={k.id}>
                              {k.tenKhoi}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        name={[field.name, "mucDo"]}
                        label="Mức độ"
                      >
                        <Select>
                          <Select.Option value="Dễ">Dễ</Select.Option>
                          <Select.Option value="Trung bình">
                            Trung bình
                          </Select.Option>
                          <Select.Option value="Khó">Khó</Select.Option>
                          <Select.Option value="Rất khó">
                            Rất khó
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        name={[field.name, "soLuong"]}
                        label="Số câu"
                      >
                        <InputNumber min={1} />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}

                <Button type="dashed" onClick={() => add()}>
                  Thêm cấu trúc
                </Button>
              </>
            )}
          </Form.List>

          <Button
            type="primary"
            htmlType="submit"
            style={{ marginTop: 20 }}
          >
            Tạo đề thi
          </Button>
        </Form>

        <div style={{ marginTop: 30 }}>
          {deThi.map((d) => (
            <Card key={d.id} title="Đề thi" style={{ marginBottom: 20 }}>
              {d.danhSach.map((c: any, i: number) => (
                <p key={c.id}>
                  Câu {i + 1}: {c.noiDung}
                </p>
              ))}
            </Card>
          ))}
        </div>
      </TabPane>
    </Tabs>
  );
};