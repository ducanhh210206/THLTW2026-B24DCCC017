import { useState, useEffect } from 'react';

const STORAGE_KEY = 'DIPLOMA_DATA';

export interface FieldConfig {
  id: number;
  name: string;
  type: 'string' | 'number' | 'date';
}

export interface QuyetDinh {
  id: number;
  soQD: string;
  ngay: string;
  trichYeu: string;
  soLuongTraCuu: number;
}

export interface VanBang {
  id: number;
  soVaoSo: number;
  soHieu: string;
  msv: string;
  hoTen: string;
  ngaySinh: string;
  quyetDinhId: number;
  extra: Record<string, unknown>;
  status: 'active' | 'revoked';
}

export default function useDiploma() {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [quyetDinhs, setQuyetDinhs] = useState<QuyetDinh[]>([]);
  const [vanBangs, setVanBangs] = useState<VanBang[]>([]);
  const [counter, setCounter] = useState(1);

  // load localStorage
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setFields(parsed.fields || []);
      setQuyetDinhs(parsed.quyetDinhs || []);
      setVanBangs(parsed.vanBangs || []);
      setCounter(parsed.counter || 1);
    }
  }, []);

  // save localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fields, quyetDinhs, vanBangs, counter })
    );
  }, [fields, quyetDinhs, vanBangs, counter]);

  // FIELD
  const addField = (field: Omit<FieldConfig, 'id'>) =>
    setFields([...fields, { ...field, id: Date.now() }]);

  const deleteField = (id: number) =>
    setFields(fields.filter((f) => f.id !== id));

  // QUYẾT ĐỊNH
  const addQuyetDinh = (qd: Omit<QuyetDinh, 'id' | 'soLuongTraCuu'>) =>
    setQuyetDinhs([
      ...quyetDinhs,
      { ...qd, id: Date.now(), soLuongTraCuu: 0 },
    ]);

  // VĂN BẰNG
  const addVanBang = (
    vb: Omit<VanBang, 'id' | 'soVaoSo' | 'status'>
  ) => {
    const newVB: VanBang = {
      ...vb,
      id: Date.now(),
      soVaoSo: counter,
      status: 'active',
    };
    setCounter(counter + 1);
    setVanBangs([...vanBangs, newVB]);
  };

  const revokeVanBang = (id: number) => {
    setVanBangs(
      vanBangs.map((v) =>
        v.id === id ? { ...v, status: 'revoked' } : v
      )
    );
  };

  // SEARCH + tracking
  const search = (params: Partial<VanBang>) => {
    const result = vanBangs.filter((vb) =>
      Object.entries(params).every(([k, v]) => {
        if (!v) return true;

        const key = k as keyof VanBang;
        const value = vb[key];

        if (value === undefined || value === null) return false;

        return value
          .toString()
          .toLowerCase()
          .includes(v.toString().toLowerCase());
      })
    );

    // tăng lượt tra cứu (immutable)
    setQuyetDinhs((prev) =>
      prev.map((qd) => {
        const found = result.find(
          (vb) => vb.quyetDinhId === qd.id
        );
        if (found) {
          return { ...qd, soLuongTraCuu: qd.soLuongTraCuu + 1 };
        }
        return qd;
      })
    );

    return result;
  };

  return {
    fields,
    quyetDinhs,
    vanBangs,
    addField,
    deleteField,
    addQuyetDinh,
    addVanBang,
    revokeVanBang,
    search,
  };
}