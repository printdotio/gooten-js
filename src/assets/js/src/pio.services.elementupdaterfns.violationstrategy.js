PIO.services.elementUpdaterFns.violationStrategy = function () {
  return function (parentActual, suggestedPosition) {
    var violations = {};
    var hadVio = false;

    if (suggestedPosition.x1 > 0) {
      violations.x1 = true;
      hadVio = true;
    }
    if (suggestedPosition.x2 < parentActual.width) {
      violations.x2 = true;
      hadVio = true;
    }
    if (suggestedPosition.y1 > 0) {
      violations.y1 = true;
      hadVio = true;
    }
    if (suggestedPosition.y2 < parentActual.height) {
      violations.y2 = true;
      hadVio = true;
    }
    if (suggestedPosition.width < parentActual.width) {
      violations.width = true;
      hadVio = true;
    }
    if (suggestedPosition.height < parentActual.height) {
      violations.height = true;
      hadVio = true;
    }
    violations.hadViolation = hadVio;
    return violations;
  };
};

PIO.util.di.register("PIO.services.elementUpdaterFns.violationStrategy", [], PIO.services.elementUpdaterFns.violationStrategy);
