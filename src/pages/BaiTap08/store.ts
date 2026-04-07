export type Destination = {
  id: number;
  name: string;
  type: string;
  price: number;
  duration: number;
};

export type DayPlan = {
  date: string;
  places: Destination[];
};

export const useStore = () => {

  const get = (key: string, def: any) => {
    if (typeof window === 'undefined') return def;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : def;
  };

  const set = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // ===== DESTINATIONS =====
  const getDestinations = (): Destination[] =>
    get("destinations", []);

  const saveDestinations = (data: Destination[]) =>
    set("destinations", data);

  // ===== PLAN =====
  const getPlan = (): DayPlan[] =>
    get("plan", [{ date: "Ngày 1", places: [] }]);

  const savePlan = (plan: DayPlan[]) =>
    set("plan", plan);

  // ===== LOGIC =====
  const calcDay = (places: Destination[]) => {
    const time = places.reduce((s, p) => s + p.duration, 0);
    const cost = places.reduce((s, p) => s + p.price, 0);
    return { time, cost };
  };

  const calcTotal = (plan: DayPlan[]) =>
    plan.flatMap(d => d.places)
        .reduce((s, p) => s + p.price, 0);

  return {
    getDestinations,
    saveDestinations,
    getPlan,
    savePlan,
    calcDay,
    calcTotal
  };
};