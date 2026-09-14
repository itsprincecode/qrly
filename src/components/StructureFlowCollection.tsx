import { DotMatrixBackground, type DotMatrixBackgroundProps } from "../shaders/dot-matrix/DotMatrixBackground";
import "../shaders/threeui.css";

export interface StructureFlowCollectionProps extends DotMatrixBackgroundProps {
  variant?: "dot-matrix" | string;
}

export function StructureFlowCollection({
  variant = "dot-matrix",
  ...props
}: StructureFlowCollectionProps) {
  if (variant === "dot-matrix") {
    return <DotMatrixBackground {...props} />;
  }
  return <DotMatrixBackground {...props} />;
}

export default StructureFlowCollection;
