"use client";

interface ScoreSector {
  name: string;
  score: number;
  maxScore: number;
}

interface RadialScoreChartProps {
  overallScore: number;
  sectors: ScoreSector[];
}

export function RadialScoreChart({
  overallScore,
  sectors,
}: RadialScoreChartProps) {
  const centerX = 200;
  const centerY = 200;
  const innerRadius = 60;
  const maxOuterRadius = 160;
  const gapAngle = 2; // degrees between sectors

  const totalSectors = sectors.length;
  const sectorAngle = (360 - gapAngle * totalSectors) / totalSectors;

  // Get color based on score percentage
  const getColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return { fill: "#3B82F6", stroke: "#60A5FA" }; // Blue
    if (percentage >= 40) return { fill: "#22C55E", stroke: "#4ADE80" }; // Green
    return { fill: "#EF4444", stroke: "#F87171" }; // Red
  };

  // Convert polar to cartesian
  const polarToCartesian = (
    cx: number,
    cy: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  };

  // Create arc path
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ) => {
    const startOuter = polarToCartesian(centerX, centerY, outerR, startAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerR, endAngle);
    const startInner = polarToCartesian(centerX, centerY, innerR, endAngle);
    const endInner = polarToCartesian(centerX, centerY, innerR, startAngle);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${startOuter.x} ${startOuter.y}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}
      L ${startInner.x} ${startInner.y}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}
      Z
    `;
  };

  // Create reference circles
  const referenceCircles = [0.33, 0.66, 1].map((ratio) => {
    const radius = innerRadius + (maxOuterRadius - innerRadius) * ratio;
    return (
      <circle
        key={ratio}
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="#374151"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
    );
  });

  return (
    <div className="relative">
      <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
        {/* Background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={maxOuterRadius + 10}
          fill="#111111"
        />

        {/* Reference circles */}
        {referenceCircles}

        {/* Sector paths */}
        {sectors.map((sector, index) => {
          const startAngle = index * (sectorAngle + gapAngle);
          const endAngle = startAngle + sectorAngle;

          // Calculate outer radius based on score
          const scoreRatio = Math.max(0.1, sector.score / sector.maxScore);
          const outerRadius =
            innerRadius + (maxOuterRadius - innerRadius) * scoreRatio;

          const colors = getColor(sector.score, sector.maxScore);

          // Label position
          const midAngle = (startAngle + endAngle) / 2;
          const labelRadius = maxOuterRadius + 30;
          const labelPos = polarToCartesian(
            centerX,
            centerY,
            labelRadius,
            midAngle
          );

          // Score badge position
          const badgeRadius = outerRadius + 15;
          const badgePos = polarToCartesian(
            centerX,
            centerY,
            badgeRadius,
            midAngle
          );

          return (
            <g key={sector.name}>
              {/* Sector arc */}
              <path
                d={createArcPath(startAngle, endAngle, innerRadius, outerRadius)}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
                className="transition-all duration-500 hover:opacity-80"
              />

              {/* Category label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-zinc-400 text-xs font-medium"
                style={{ fontSize: "10px" }}
              >
                {sector.name}
              </text>

              {/* Score badge */}
              <g>
                <rect
                  x={badgePos.x - 14}
                  y={badgePos.y - 10}
                  width="28"
                  height="20"
                  rx="4"
                  fill={colors.fill}
                  className="drop-shadow-lg"
                />
                <text
                  x={badgePos.x}
                  y={badgePos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-bold"
                  style={{ fontSize: "11px" }}
                >
                  {Math.round(sector.score)}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center circle with overall score */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill="url(#centerGradient)"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Overall score text */}
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold"
          style={{ fontSize: "36px" }}
        >
          {Math.round(overallScore)}
        </text>

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
