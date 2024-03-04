export const groupData = <T>(data: T[], groupBy: keyof T, nestedKey?: string) => {
  return data.reduce(
    (acc, item) => {
      if (nestedKey) {
        item[groupBy as string].forEach((elem) => {

          const key: string = elem[nestedKey] as string


          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(item);
        })
        return acc;
      } else {
        const key = item[groupBy] as string

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(item);
        return acc;
      }


    },
    {} as Record<string, T[]>,
  );
}