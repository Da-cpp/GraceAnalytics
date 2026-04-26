export type ModelInputs = {
  competitorWeight: number;
  incomeWeight: number;
  roadWeight: number;
  demandMultiplier: number;
};

export type Parish = {
  name: string;
  population: number;
  opportunityScore: number;
  insight: string;
};

export type ProcessedParish = Parish & {
  adjustedScore: number;
  drivers: {
    demandEffect: number;
    competitionEffect: number;
    incomeEffect: number;
    roadEffect: number;
  };
};


export function runModel(
  inputs: ModelInputs,
  data: Parish[]
): ProcessedParish[] {

  return data.map((p) => {
    
    const base = p.opportunityScore / 100;

    const populationFactor = Math.log10(p.population + 1) / 6;


    const demandEffect = 1 + inputs.demandMultiplier * 0.6;

    const competitionEffect = 1 - inputs.competitorWeight * 0.35;

    const incomeEffect = 1 + inputs.incomeWeight * populationFactor * 0.4;

    const roadEffect = 1 + inputs.roadWeight * (0.2 + populationFactor * 0.3);

    let adjusted =
      base *
      demandEffect *
      competitionEffect *
      incomeEffect *
      roadEffect *
      100;

    adjusted = Math.max(0, Math.min(100, adjusted));

    return {
      ...p,
      adjustedScore: adjusted,
      drivers: {
        demandEffect,
        competitionEffect,
        incomeEffect,
        roadEffect,
      },
    };
  });
}