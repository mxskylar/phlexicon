// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
export const sortAscending = (a: number, b: number): number => {
    if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
}

export const sortDescending = (a: number, b: number): number => {
    if (a > b) {
        return -1;
      } else if (a < b) {
        return 1;
      }
      return 0;
}