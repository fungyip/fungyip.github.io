---
permalink: /econometrics/
title: Econometrics
use_math: true
author_profile: false
---

### The Essence of Econometrics

![Two T-shirts reading "(X'X)^-1 X'y is OLSchool" and "(X'X)^-1 X'y my life!"](https://4.bp.blogspot.com/-qn3YRa-rr50/TZOzK29BAXI/AAAAAAAABCA/tZIYm6ApLhs/s1600/metrics_shirts_academicabstractions_com.jpg){: width="320"}

#### Ordinary Least Squares (OLS)

$$\mathbf{b} = \begin{bmatrix} b_0 \\ b_1 \\ \vdots \\ b_{p-1} \end{bmatrix} = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y}$$

| Step | Explanation |
|---|---|
| $$\mathbf{y} = \mathbf{X}\mathbf{b}$$ | The linear regression model |
| $$\mathbf{X}'\mathbf{y} = \mathbf{X}'\mathbf{X}\mathbf{b}$$ | Pre-multiply both sides by \\(\mathbf{X}'\\) |
| $$(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y} = (\mathbf{X}'\mathbf{X})^{-1}(\mathbf{X}'\mathbf{X})\mathbf{b}$$ | Pre-multiply both sides by the inverse \\((\mathbf{X}'\mathbf{X})^{-1}\\) |
| $$(\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y} = \mathbf{I}\mathbf{b}$$ | A matrix multiplied by its inverse is the identity matrix |
| $$\mathbf{b} = (\mathbf{X}'\mathbf{X})^{-1}\mathbf{X}'\mathbf{y}$$ | The OLS estimator |

#### Classical OLS Assumptions

| Assumption | Expression | If violated |
|---|---|---|
| 1. Linearity | $$Y_t = \alpha + \beta X_t + \varepsilon_t$$ | Misspecified model |
| 2. Zero mean error | $$E(\varepsilon \mid X) = 0$$ | Biased estimates |
| 3. Exogenous regressors | $$\operatorname{Cov}(X_s, \varepsilon_t) = 0$$ | Endogeneity bias |
| 4. No serial correlation | $$\operatorname{Cov}(\varepsilon_s, \varepsilon_t) = 0,\ s \neq t$$ | Serial correlation |
| 5. Homoskedasticity | $$\operatorname{Var}(\varepsilon_t) = \sigma^2$$ | Heteroskedasticity |
| 6. No perfect multicollinearity | No regressor is an exact linear combination of the others | Multicollinearity |
| 7. Normal errors | $$\varepsilon_t \sim N(0, \sigma^2)$$ | Invalid small-sample inference |
