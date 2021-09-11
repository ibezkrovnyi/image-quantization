const hardcodedVersions = {
  '@types/node': '16.9.1',
};

const fi = (dependencies, handler) => {
  if (Boolean(dependencies) && typeof dependencies === 'object') {
    const result = Object.create(null);
    for (const [name, versionSpec] of Object.entries(dependencies)) {
      const handlerResult = handler([name, versionSpec]);
      console.log(handlerResult);
      if (Array.isArray(handlerResult)) {
        result[handlerResult[0]] = handlerResult[1];
      }
      delete dependencies[name];
    }
    console.log(JSON.stringify(result, null, '  '));
    Object.assign(dependencies, result);
  }
};

const r = { '@types/node': '111' };
fi(r, ([name, versionSpec]) =>
  Object.keys(hardcodedVersions).includes(name)
    ? [name, hardcodedVersions[name]]
    : [name, versionSpec],
);

console.log(JSON.stringify(r, null, '  '));
