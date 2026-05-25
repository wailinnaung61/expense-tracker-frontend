/**
 * Safe arithmetic expression parser — no eval().
 * Supports: digits, decimal points, +  -  *  /  with standard precedence (* / before + -).
 * Returns null if the expression is invalid or results in division by zero.
 */
export function parseExpression(expr: string): number | null {
  const clean = expr.trim().replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[\d.+\-*/\s]+$/.test(clean)) return null;

  try {
    // Tokenise into numbers and operators
    const tokens = clean.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
    if (!tokens) return null;

    // Convert to numbers / operators
    const nums: number[] = [];
    const ops: string[] = [];

    let expectNumber = true;
    for (const tok of tokens) {
      if (tok === "+" || tok === "-" || tok === "*" || tok === "/") {
        if (expectNumber) return null; // two operators in a row
        ops.push(tok);
        expectNumber = true;
      } else {
        if (!expectNumber) return null; // two numbers in a row
        const n = parseFloat(tok);
        if (isNaN(n)) return null;
        nums.push(n);
        expectNumber = false;
      }
    }
    if (expectNumber) return null; // trailing operator

    // Apply * / first (standard precedence)
    let i = 0;
    while (i < ops.length) {
      if (ops[i] === "*" || ops[i] === "/") {
        const result =
          ops[i] === "*" ? nums[i] * nums[i + 1] : nums[i] / nums[i + 1];
        if (!isFinite(result)) return null; // division by zero
        nums.splice(i, 2, result);
        ops.splice(i, 1);
      } else {
        i++;
      }
    }

    // Apply + -
    let total = nums[0];
    for (let j = 0; j < ops.length; j++) {
      total = ops[j] === "+" ? total + nums[j + 1] : total - nums[j + 1];
    }

    return isFinite(total) ? total : null;
  } catch {
    return null;
  }
}

export function formatResult(n: number): string {
  // Up to 10 significant digits, strip trailing zeros
  return parseFloat(n.toPrecision(10)).toString();
}

export function formatApplyValue(n: number): string {
  // Always 2 decimal places for money, strip trailing zeros e.g. "5.00" → "5", "5.50" → "5.5"
  return parseFloat(n.toFixed(2)).toString();
}

export function daysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
