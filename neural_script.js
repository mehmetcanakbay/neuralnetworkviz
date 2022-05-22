function CreateMatrixGivenROW_COL(x, y) {
    arr = []
    for (let i = 0; i < x; i++) {
        arr.push(Array.from({length:y},()=>Math.random()))
    }
    return arr
}

function create_weights() {
    input_arr = CreateMatrixGivenROW_COL(1,25) //1,100
    w1 = CreateMatrixGivenROW_COL(25,10) //1, 10
    w2 = CreateMatrixGivenROW_COL(10, 10) //1, 10
    w3 = CreateMatrixGivenROW_COL(10, 20) //1, 20
    w4 = CreateMatrixGivenROW_COL(20, 1) // 1, 1
}

//author:@fmaul
mmultiply = (a, b) => a.map(x => transpose(b).map(y => dotproduct(x, y)));
dotproduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
transpose = a => a[0].map((x, i) => a.map(y => y[i]));
//endauthor

msub = (a,b) => a.map((x,i) => x.map((t,j) => a[i][j] - b[i][j]))
arr_mul = (a,b) => a.map((x,i) => x.map((t,j) => t*b))

function predict() {
    let mul1 = mmultiply(input_arr, w1) // 1,10
    let mul2 = mmultiply(mul1, w2) // 1,10 
    let mul3 = mmultiply(mul2, w3) // 1,20
    let y_hat = mmultiply(mul3, w4) // 1,1
    return y_hat
}

function trainstep(ytrue) {
    let mul1 = mmultiply(input_arr, w1) // 1,10
    let mul2 = mmultiply(mul1, w2) // 1,10 
    let mul3 = mmultiply(mul2, w3) // 1,20
    let y_hat = mmultiply(mul3, w4) // 1,1

    let mse_error = ((ytrue-y_hat)**2) / 100

    let mse_deriv = -2/100 * (ytrue-y_hat)
    let dE_w4 = mmultiply(transpose(mul3), [[mse_deriv]]) //20, 1 x 1,1 == 20,1


    let dE_mul3 = mmultiply([[mse_deriv]], transpose(w4)) //1,20 
    let dE_w3 = mmultiply(transpose(mul2), dE_mul3)  //10,1x1,20 == 10,20

    let dE_mul2 = mmultiply(dE_mul3,transpose(w3)) //1,20 x 20, 10 == 1, 10
    let dE_w2 = mmultiply(transpose(mul1), dE_mul2) //10,1 x 1,10 == 10, 10

    let dE_mul1 = mmultiply(dE_mul2, transpose(w2)) // 1,10 x 10,10 == 1,10
    let dE_w1 = mmultiply(transpose(input_arr),dE_mul1) // 100,1 x 1, 10
    
    w4 = msub(w4, arr_mul(dE_w4,lr))
    w3 = msub(w3, arr_mul(dE_w3,lr))
    w2 = msub(w2, arr_mul(dE_w2,lr))
    w1 = msub(w1, arr_mul(dE_w1,lr))

    return mse_error
}

function trainstep_10() {
    let losses = []
    for (let i = 0; i< 2; i++) {
        losses.push(trainstep(y_true));
    }
    return losses
}

function create_plot() {
    var data = [{
        y: trainstep_10(y_true),
        type: "line"
    }];

    var layout = {
        autosize:false,
        width:800,
        height:500,
        yaxis: {
            title: "Loss"
        },
        xaxis: {
            title: "Trainstep"
        }
    }

    Plotly.newPlot('plot', data, layout);
}

function StopUpdating() {
    clearInterval(update_interval)
}

function create_latex_version_of_matrix(MATRIX) {
    let out_str = "\\begin{bmatrix}"
    for (let i = 0; i<MATRIX.length; i++) {
        for (let j = 0; j < MATRIX[i].length; j++) {
            out_str += MATRIX[i][j].toString().slice(0,7) + "&"
        }
        out_str += "\\\\"
    }
    out_str += "\\end{bmatrix}"
    return out_str
} 

function get_current_selected_weight_name() {
    switch (current_weights_selected) {
        case 0:
            return "weight 1"
        case 1:
            return "weight 2"
        case 2:
            return "weight 3"
        case 3:
            return "weight 4"
    }
}

function created_latex_based_on_selection() {
    switch (current_weights_selected) {
        case 0:
            return create_latex_version_of_matrix(w1)
        case 1:
            return create_latex_version_of_matrix(w2)
        case 2:
            return create_latex_version_of_matrix(w3)
        case 3:
            return create_latex_version_of_matrix(w4)
    }
}

function StartUpdating() {
    update_interval = setInterval(()=>{
        y_true = document.getElementById("var_input").value
        lr = document.getElementById("lr_input").value
        document.getElementById("predicting_variable_notif").innerHTML = `Predicting variable: ${y_true}`
        document.getElementById("selected_weight").innerHTML = `Showing: ${get_current_selected_weight_name()}` 
        let y_ = trainstep_10(y_true)
        Plotly.extendTraces('plot', {y:[y_]}, [0])
        document.getElementById("output_title").innerHTML = `Current output: ${predict()}` 

        var lat = created_latex_based_on_selection()

        katex.render(lat, document.getElementById("weights_latex"));

    }, 200)
}

var current_weights_selected = 2
lr = 1e-6

create_weights()
y_true = 2
document.getElementById("predicting_variable_notif").innerHTML = `Predicting variable: ${y_true}`

create_plot()


