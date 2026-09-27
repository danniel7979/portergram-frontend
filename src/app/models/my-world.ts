export interface WorldVisualElement {
  id: string;
  name: string;
  type: string;
  order: number;

  stageId: string;
  variant: string;
  animation: string;

  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  rotation: number;
  scale: number;
  anchor: string;

  metadata?: Record<string, unknown>;
}

export interface WorldUnlockCondition {
  statistic: string;
  currentValue: number;
  requiredValue: number;
  remaining: number;
  progress: number;
}

export interface WorldNextUnlock {
  id: string;
  name: string;
  description: string;
  type: string;
  progress: number;
  conditions: WorldUnlockCondition[];
}

export interface MyWorldAside {
  worldType: string;
  worldName: string;
  icon: string;

  level: number;
  experience: number;
  levelProgress: number;

  unlockedCount: number;
  totalElements: number;
  completionPercentage: number;

  visualElements: WorldVisualElement[];

  nextUnlock: WorldNextUnlock | null;

  newUnlocks: string[];
}

export interface MyWorldAsideResponse {
  status: string;
  world: MyWorldAside;
}