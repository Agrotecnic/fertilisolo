export const calculatePhosphorusNeed = (currentP: number): number => {
  const targetP = 15;
  
  if (currentP >= targetP) return 0;

  const pNeeded = targetP - currentP;
  
  let factor = 0;
  
  if (currentP <= 5) {
    factor = 503.80;
  } else if (currentP <= 10) {
    factor = 412.20;
  } else if (currentP <= 20) {
    factor = 320.60;
  } else {
    factor = 229.00;
  }

  return pNeeded * factor / 100;
};

export const calculateSulfurNeed = (currentS: number): number => {
  const targetS = 10;
  if (currentS >= targetS) return 0;
  return (targetS - currentS) * 10;
};

export const calculateBoronNeed = (currentB: number): number => {
  const targetB = 0.3;
  if (currentB >= targetB) return 0;
  return (targetB - currentB) * 2;
};

export const calculateCopperNeed = (currentCu: number): number => {
  const targetCu = 0.8;
  if (currentCu >= targetCu) return 0;
  return (targetCu - currentCu) * 3;
};

export const calculateIronNeed = (currentFe: number): number => {
  const targetFe = 12;
  if (currentFe >= targetFe) return 0;
  return (targetFe - currentFe) * 5;
};

export const calculateManganeseNeed = (currentMn: number): number => {
  const targetMn = 5;
  if (currentMn >= targetMn) return 0;
  return (targetMn - currentMn) * 4;
};

export const calculateZincNeed = (currentZn: number): number => {
  const targetZn = 1.5;
  if (currentZn >= targetZn) return 0;
  return (targetZn - currentZn) * 8;
};

export const calculateMolybdenumNeed = (currentMo: number): number => {
  const targetMo = 0.1;
  if (currentMo >= targetMo) return 0;
  return (targetMo - currentMo) * 15;
};
