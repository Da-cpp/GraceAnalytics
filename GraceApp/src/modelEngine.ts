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

/**
 * Simple market intelligence model layer.
 * This simulates how your XGBoost / RAG pipeline would adjust scores
 * based on business scenario inputs.
 */
export function runModel(
  inputs: ModelInputs,
  data: Parish[]
): ProcessedParish[] {

  return data.map((p) => {
    
    // ---- NORMALISATION BASES ----
    const base = p.opportunityScore / 100;

    const populationFactor = Math.log10(p.population + 1) / 6;

    // ---- EFFECTS ----

    // Demand increases all regions proportionally
    const demandEffect = 1 + inputs.demandMultiplier * 0.6;

    // Competition reduces opportunity
    const competitionEffect = 1 - inputs.competitorWeight * 0.35;

    // Income weight (proxy: higher population = higher income opportunity)
    const incomeEffect = 1 + inputs.incomeWeight * populationFactor * 0.4;

    // Road access assumption (soft multiplier since we don't have real road data here)
    const roadEffect = 1 + inputs.roadWeight * (0.2 + populationFactor * 0.3);

    // ---- FINAL SCORE ----
    let adjusted =
      base *
      demandEffect *
      competitionEffect *
      incomeEffect *
      roadEffect *
      100;

    // Clamp to realistic range
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