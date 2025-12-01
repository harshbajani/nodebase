import { useQueryStates } from "nuqs";
import { exectuionsParams } from "../params";

export const useExecutionsParams = () => {
  return useQueryStates(exectuionsParams);
};
