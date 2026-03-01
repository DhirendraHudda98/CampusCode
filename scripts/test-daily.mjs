function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }
  const m = nums1.length;
  const n = nums2.length;
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;
    const maxLeft1  = i === 0 ? -Infinity : nums1[i - 1];
    const minRight1 = i === m ?  Infinity : nums1[i];
    const maxLeft2  = j === 0 ? -Infinity : nums2[j - 1];
    const minRight2 = j === n ?  Infinity : nums2[j];
    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      if ((m + n) % 2 === 1) return Math.max(maxLeft1, maxLeft2);
      else return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
    } else if (maxLeft1 > minRight2) {
      hi = i - 1;
    } else {
      lo = i + 1;
    }
  }
}

// Simulate exactly what the backend harness does (multiArg = true, spread)
const testCases = [
  { input: "[[1,3], [2]]",   expected: "2" },
  { input: "[[1,2], [3,4]]", expected: "2.5" },
  { input: "[[0,0], [0,0]]", expected: "0" },
];

let allPass = true;
for (const tc of testCases) {
  const args   = JSON.parse(tc.input);          // [[1,3],[2]]
  const result = findMedianSortedArrays(...args); // spread — 2 params
  const got    = JSON.stringify(result);
  const exp    = JSON.stringify(JSON.parse(tc.expected));
  const ok     = got === exp;
  if (!ok) allPass = false;
  console.log(ok ? "✅" : "❌", "Input:", tc.input, "| Expected:", exp, "| Got:", got);
}
console.log(allPass ? "\n🎉 All test cases pass!" : "\n❌ Some test cases failed");
