---
permalink: /econometrics/
title: Econometrics
use_math: true
author_profile: false
---


### The Essence of Econometrics

![Alt Text](http://4.bp.blogspot.com/-qn3YRa-rr50/TZOzK29BAXI/AAAAAAAABCA/tZIYm6ApLhs/s1600/metrics_shirts_academicabstractions_com.jpg)

#### Ordinary Least Squares (OLS)
<br>

$$\mathbf{b} = \left[\begin{array}
{}
b_0\\
b_1\\
\vdots\\
b_{p-1}
\end{array}\right]
= \mathbf{(X'X)^{-1}X^{\prime}y}$$

Linear Algebra | Enter the Matrix
---------------|-----------------
$$\mathbf{y} = \mathbf{Xb}$$ | Linear Regression
$$\mathbf{(X'y) =X^{\prime}Xb}$$|Pre-multiply both sides of the equation by X' in order to solve for b
$$\mathbf{(X'X)^{-1}X'y =(X^{\prime}X)^{-1}(X^{\prime}X)b}$$|Multiply (X'X)-1 by this inverse
$$\mathbf{(X'X)^{-1}X'y = Ib}$$|A matrix multiplied by its inverse is the identity matrix (I)
$$\mathbf{(X'X)^{-1}X'y = b}$$| OLS
$$\mathbf{b} = \mathbf{(X'X)^{-1}X^{\prime}y}$$| OLS

#### 8 Classical OLS Assumptions
Assumption / Violation may imply | Mathematical Expression       
---------------------------------|------------------------
Linearity | $$Y_t = \alpha + \beta X_t + ε_t$$
Expected value of error term is zero | $$E(ε∣X) = 0$$   
X is non-stochastic and fixed in repeated samples (exogeneity) | $$Cov(X_s, ε_t) = 0$$
Serial Independence | $$Cov(ε_s, ε_t) = 0 $$        
Homoskedasticity | $$Var(ε_t) = \sigma^2 = constant$$
No Multicollinearity |  $$\sum_{t=1}^{T} (\delta_iX_{it} + \delta_jX_{jt}) \neq 0 \text{ and } i \neq j $$                            
Normality of disturbance |           





<!---



#### 8 Classical OLS Assumptions
Assumption      | Mathematical Expression            | Violation may imply
----------------|------------------------------------|-----------------------
Linearity       | $$Y_t = \alpha + \beta X_t + ε_t$$ |  Nonlinearity
Expected value of error term is zero| $$E(ε∣X) = 0$$ |  Biased intercept  
X is non-stochastic and fixed in repeated samples (exogeneity) | $$Cov(X_s, ε_t) = 0$$ | Serial correlation
Serial Independence | $$Cov(ε_s, ε_t) = 0 $$        | Serial correlation
Homoskedasticity | $$Var(ε_t) = \sigma^2 = constant$$ | Heteroskedasticity
No Linear Relationships |  $$\sum_{t=1}^{T} (\delta_iX_{it} + \delta_jX_{jt}) \neq 0 \text{ and } i \neq j $$                            |Multicollinearity
Normality of disturbance |           | Outliers

<!---
 \[ε_t \sim \mathcal{N}(\mu,\,\sigma^{2})\,\]  

https://www.albert.io/blog/key-assumptions-of-ols-econometrics-review/
http://statisticsbyjim.com/regression/ols-linear-regression-assumptions/
#### Scalars, Vectors, Matrices and Tensors

Welcome to Matrix
Scalar: one number
Vector: row/column of numbers
Matrix: many rows & columns
Tensors:
Machines :love Matrix

![Alt Text](https://upload.wikimedia.org/wikipedia/commons/6/6a/Agency_Matrix_Cube.png)



#### Python Code
```Python
import numpy as np
A = np.array([[1,2], [3,4], [5,6]])
A.T
A_inv = np.linalg.inv(A)
```

![BI](https://public.tableau.com/views/HongKongDistrictsandConstituencyAreasBoundaryMap_0/Sheet1?:embed=y&:display_count=yes&publish=yes)


<div class='tableauPlaceholder' id='viz1543025014426' style='position: relative'><noscript><a href='#'><img alt=' ' src='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;Ho&#47;HongKongDistrictsandConstituencyAreasBoundaryMap_0&#47;Sheet1&#47;1_rss.png' style='border: none' /></a></noscript><object class='tableauViz'  style='display:none;'><param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' /> <param name='embed_code_version' value='3' /> <param name='site_root' value='' /><param name='name' value='HongKongDistrictsandConstituencyAreasBoundaryMap_0&#47;Sheet1' /><param name='tabs' value='no' /><param name='toolbar' value='yes' /><param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;Ho&#47;HongKongDistrictsandConstituencyAreasBoundaryMap_0&#47;Sheet1&#47;1.png' /> <param name='animate_transition' value='yes' /><param name='display_static_image' value='yes' /><param name='display_spinner' value='yes' /><param name='display_overlay' value='yes' /><param name='display_count' value='yes' /><param name='filter' value='publish=yes' /></object></div>                <script type='text/javascript'>                    var divElement = document.getElementById('viz1543025014426');                    var vizElement = divElement.getElementsByTagName('object')[0];                    vizElement.style.width='100%';vizElement.style.height=(divElement.offsetWidth*0.75)+'px';                    var scriptElement = document.createElement('script');                    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';                    vizElement.parentNode.insertBefore(scriptElement, vizElement);                </script>











<!---

$$\mathbf{b} = \mathbf{(X'X)^{-1}X^{\prime}y}$$

$$\mathbf{b} = \left[\begin{array}
{}
b_0\\
b_1\\
\vdots\\
b_{p-1}
\end{array}\right]
= \mathbf{(X'X)^{-1}X^{\prime}y}
$$

$$\mathbf{y} = \mathbf{Xb+e}$$

$$\mathbf{y} = \mathbf{Xb}$$

$$\mathbf{(X'y) =X^{\prime}Xb}$$

$$\mathbf{(X'X)^{-1}X'y =(X^{\prime}X)^{-1}(X^{\prime}X)b}$$

$$\mathbf{(X'X)^{-1}X'y = Ib}$$

$$\mathbf{(X'X)^{-1}X'y = b}$$

http://www.math.mcgill.ca/yyang/regression/RMarkdown/example.html

<!---

<div class='card-section'>
    <div class='skills'>
        <div class='skills-col'>
            <div class="skills-cat">Data Wrangling</div>
            <div class="skills-item">
                <img src="../images/logo/dplyr.jpg" width="30" alt="dplyr icon" title="dplyr">
                dplyr
            </div>
            <div class="skills-item">
                <img src="../images/logo/purrr.jpg" width="30" alt="purrr icon" title="purrr">
                purrr
            </div>
        </div>
        <div class='skills-col'>
            <div class="skills-cat">Machine Learning</div>
            <div class="skills-item">
                <img src="../images/logo/forecast.png" width="30" alt="forecast icon" title="forecast">
                forecast
            </div>
            <div class="skills-item">
                <img src="../images/logo/h2o.png" width="30" alt="h2o icon" title="h2o">
                h2o
            </div>
            <div class="skills-item">
                <img src="../images/logo/sklearn.png" width="30" alt="sklearn icon" title="scikit-learn">
                scikit-learn
            </div>
        </div>
        <div class='skills-col'>
            <div class="skills-cat">Data Viz/DL</div>
            <div class="skills-item">
                <img src="../images/logo/qliksense.PNG" width="30" alt="qliksense icon" title="qliksense">
                qliksense
            </div>
            <div class="skills-item">
                <img src="../images/logo/tableau.PNG" width="30" alt="tableau icon" title="tableau">
                tableau
            </div>
        </div>
        </div>
        </div>

--->
