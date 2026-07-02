export interface TreeLevelInfo {
  icon: string;
  name: string;
  nextLevelMins: number;
  percent: number;
  isMax: boolean;
}

export const getTreeLevelInfo = (minutes: number): TreeLevelInfo => {
  let icon = '🌱';
  let name = 'Mầm Non';
  let nextLevelMins = 0;
  let isMax = false;
  
  if (minutes < 30) {
    icon = '🌱';
    name = 'Mầm Non';
    nextLevelMins = 30;
  } else if (minutes < 120) {
    icon = '🌿';
    name = 'Cây Non';
    nextLevelMins = 120;
  } else if (minutes < 500) {
    icon = '🌳';
    name = 'Cây Xanh Tốt';
    nextLevelMins = 500;
  } else {
    icon = '🌲✨';
    name = 'Cổ Thụ Tri Thức';
    nextLevelMins = minutes; // Max level
    isMax = true;
  }
  
  const percent = isMax ? 100 : (minutes / nextLevelMins) * 100;

  return { icon, name, nextLevelMins, percent, isMax };
};
