if (typeof Grafico !== 'function') {
    window.Grafico = class {

        /**
         * Container onde será renderizado
         * @param container
         */
        constructor(container) {
            //determina o elemento destino do chart
            this.container = container || document.getElementsByName("body");
            this.title = "";
            this.y = "";
            this.x = "";
            this.type = "bar";
            this.operacao = "soma";
            this.reverse = !1;
            this.groupBy = "day";
            this.options = {};
            this.xType = "category";
            this.precision = 0;
            this.maximo = 100;
            this.labelY = "";
            this.labelX = "";
            this.minimoY = "";
            this.maximoY = "";
            this.minimoX = "";
            this.maximoX = "";
            this.legendShow = !0;
            this.cornerRounded = "smooth";
        }

        setElementTarget(container) {
            this.container = container;
        }

        setPrecision(casas) {
            this.precision = casas;
        }

        setMinimoY(minimo) {
            this.minimoY = minimo;
        }

        setMaximoY(minimo) {
            this.maximoY = minimo;
        }

        setMinimoX(maximo) {
            this.minimoX = maximo;
        }

        setMaximoX(maximo) {
            this.maximoX = maximo;
        }

        setCornerRounded(rounded) {
            if (["smooth", "straight", "stepline"].indexOf(rounded) > -1)
                this.cornerRounded = rounded;
        }

        setLabelY(label) {
            if (typeof label === "string" && !isEmpty(label))
                this.labelY = label;
        }

        setLabelX(label) {
            if (typeof label === "string" && !isEmpty(label))
                this.labelX = label;
        }

        setMaximo(maximo) {
            if (isNumberPositive(maximo))
                this.maximo = parseInt(maximo);
        }

        setData(data, title, y, x, type, funcao, reverse) {
            this.data = data;
            this.title = title || this.title || "";
            this.y = y || this.y || "";
            this.x = x || this.x || "";
            this.type = type || this.type || "bar";
            this.operacao = funcao || this.operacao || "soma";
            this.reverse = reverse || this.reverse || !1;

            this.workData();
        }

        setTitle(title) {
            this.title = title;
            this.setOptions({
                legend: {
                    show: true
                }
            });
        }

        setOrderReverse() {
            this.reverse = !0;
        }

        setX(x) {
            this.x = x;
        }

        setY(y) {
            this.y = y;
        }

        setType(type) {
            this.type = type;
        }

        setOperacao(operacao) {
            if (["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        setOperacaoSoma() {
            this.operacao = 'soma';
        }

        setOperacaoMaioria() {
            this.operacao = 'maioria';
        }

        setOperacaoMedia() {
            this.operacao = 'media';
        }

        /**
         * Define agrupamento dos dados por hora
         * @param operacao
         */
        setGroupByHour(operacao) {
            this.groupBy = "hour";
            if (typeof operacao !== "undefined" && ["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        /**
         * Define agrupamento dos dados por dia
         * @param operacao
         */
        setGroupByDay(operacao) {
            this.groupBy = "day";
            if (typeof operacao !== "undefined" && ["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        /**
         * Define agrupamento dos dados por semana
         * @param operacao
         */
        setGroupByWeek(operacao) {
            this.groupBy = "week";
            if (typeof operacao !== "undefined" && ["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        /**
         * Define agrupamento dos dados por mês
         * @param operacao
         */
        setGroupByMonth(operacao) {
            this.groupBy = "month";
            if (typeof operacao !== "undefined" && ["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        /**
         * Define agrupamento dos dados por ano
         * @param operacao
         */
        setGroupByYear(operacao) {
            this.groupBy = "year";
            if (typeof operacao !== "undefined" && ["soma", "media", "maioria"].indexOf(operacao) > -1)
                this.operacao = operacao;
        }

        setOptions(option) {
            mergeObject(this.options || {}, option);
        }

        toogleLegendShow() {
            this.legendShow = !this.legendShow;
        }

        getType() {
            switch (this.type) {
                case "lineSoft":
                case "lineSquad":
                    return "line";
                    break;
                case "areaHard":
                case "areaSquad":
                    return "area";
                    break;
                case "barHorizontal":
                    this.setOptions({
                        plotOptions: {
                            bar: {
                                horizontal: true,
                            }
                        }
                    });
                    return "bar";
                    break;
                default:
                    return this.type;
            }
        }

        workCornerRound() {
            if (["line", "area"].indexOf(this.getType()) > -1) {
                this.setOptions({
                    stroke: {
                        curve: this.cornerRounded
                    }
                });
            } else if (this.getType() === "bar") {
                this.setOptions({
                    plotOptions: {
                        bar: {
                            columnWidth: '400%',
                            distributed: true,
                            endingShape: (this.cornerRounded === "smooth" ? 'rounded' : 'flat')
                        },
                    }
                });
            }
        }

        /**
         * Retorna opções padrões já definidas
         * @returns {{xaxis: {categories: number[]}, series: [{data, name: string}], chart: {type: (*|string)}}}
         */
        getOptions() {

            this.workCornerRound();

            /**
             * Faz a leitura dos dados da lingua nativa
             */
            return getJSON("assetsPublic/language/pt-br.json").then(language => {

                /**
                 * Monta retorno
                 */
                this.setOptions({
                    chart: {
                        type: this.getType(),
                        locales: [language],
                        defaultLocale: 'pt-br',
                        width: "100%",
                        toolbar: {
                            show: true,
                            offsetX: 0,
                            offsetY: 0,
                            tools: {
                                download: false,
                                selection: false,
                                zoom: true,
                                zoomin: false,
                                zoomout: false,
                                pan: false,
                                reset: true,
                                customIcons: []
                            },
                            autoSelected: 'zoom'
                        }
                    },
                    theme: {
                        monochrome: {
                            enabled: true,
                            color: THEME,
                            shadeTo: 'light',
                            shadeIntensity: 0.65
                        }
                    }
                });

                return this.options;
            });
        }

        /**
         * Com base em uma lista de dados, opera o X, Y, order and operation
         */
        getWorkedData() {
            let data = [];
            let isDataTimeComplete = !1;

            /**
             * Verifica se o campo Y existe
             */
            if (typeof this.data[0][this.y] === "undefined") {
                toast("Gráfico: Campo Y definido, mas não existe", 5000, "toast-warning");
                return data;
            }

            if (typeof this.x === "string" && !isEmpty(this.x)) {

                /**
                 * Verifica se o campo X existe
                 */
                if (typeof this.data[0][this.x] === "undefined") {
                    toast("Gráfico: Campo X definido, mas não existe", 5000, "toast-warning");
                    return data;
                }

                isDataTimeComplete = (this.xType === "datetime" && moment(this.data[0][this.x], "YYYY-MM-DD[T]HH:mm:ss", true).isValid());

                /**
                 * Par de valor X e Y
                 */
                for (let i in this.data) {
                    data.push({
                        x: (isDataTimeComplete ? this.data[i][this.x].replace("T", " ") : this.data[i][this.x]),
                        y: this.data[i][this.y]
                    })
                }

            } else {
                isDataTimeComplete = !1;
                this.xType = "category";

                for (let i in this.data)
                    data.push({x: i, y: parseFloat(this.data[i][this.y])});
            }

            /**
             * Aplica a função de Soma, Média ou Maioria
             */
            return this.exeFuncao(data, isDataTimeComplete);
        }

        /**
         * Retorna a soma dos registros com base no eixo X
         */
        getSumData() {
            let count = {};
            for (let i in this.data) {
                let x = "";
                let countHelper = 1;

                if (this.xType === "datetime") {
                    if (this.groupBy === "hour") {
                        x = (isDataTimeComplete ? moment(this.data[i][this.x]).format("YYYY-MM-DD hh:mm:ss") : moment(this.data[i][this.x]).format("YYYY-MM-DD") + zeroEsquerda(countHelper) + ":00:00");
                        countHelper++;
                    } else if (this.groupBy === "day") {
                        x = moment(this.data[i][this.x]).format("YYYY-MM-DD");
                    } else if (this.groupBy === "week") {
                        x = moment(this.data[i][this.x]).day("Sunday").format("YYYY-MM-DD");
                    } else if (this.groupBy === "month") {
                        x = moment(this.data[i][this.x]).format("YYYY-MM-[01]");
                    } else if (this.groupBy === "year") {
                        x = moment(this.data[i][this.x]).format("YYYY-[01]-[01]");
                    } else {
                        x = this.groupBy;
                    }
                } else {
                    x = this.data[i][this.x];
                }

                if (typeof count[x] === "undefined")
                    count[x] = 0;

                count[x]++;
            }

            let data = [];
            for (let x in count) {
                data.push({
                    x: x,
                    y: parseFloat(count[x]).toFixed(this.precision)
                });
            }

            return data;
        }

        /**
         * Função de Soma, média, maioria
         * @param data
         * @param isDataTimeComplete
         * @returns {[]}
         */
        exeFuncao(data, isDataTimeComplete) {
            let dados = {};
            let count = {};
            let countMaioria = {};
            let retorno = [];

            if (['soma', 'media', 'maioria'].indexOf(this.operacao) === -1)
                return data;

            if ((this.operacao === 'soma' || this.operacao === 'media') && isNaN(data[0].y)) {
                toast("Gráfico: Soma ou Média necessita valores numéricos no campo Y", 6000, "toast-warning");
                return data;
            }

            for (let i in data) {
                let x = "";
                let countHelper = 1;

                if (this.type === "radialBar") {
                    x = this.y;
                } else if (this.xType === "datetime") {
                    if (this.groupBy === "hour") {
                        x = (isDataTimeComplete ? moment(data[i].x).format("YYYY-MM-DD hh:mm:ss") : moment(data[i].x).format("YYYY-MM-DD") + zeroEsquerda(countHelper) + ":00:00");
                        countHelper++;
                    } else if (this.groupBy === "day") {
                        x = moment(data[i].x).format("YYYY-MM-DD");
                    } else if (this.groupBy === "week") {
                        x = moment(data[i].x).day("Sunday").format("YYYY-MM-DD");
                    } else if (this.groupBy === "month") {
                        x = moment(data[i].x).format("YYYY-MM-[01]");
                    } else if (this.groupBy === "year") {
                        x = moment(data[i].x).format("YYYY-[01]-[01]");
                    } else {
                        x = this.groupBy;
                    }
                } else {
                    x = data[i].x;
                }

                if (typeof dados[x] === "undefined") {
                    dados[x] = 0.0;
                    count[x] = 0;
                    if (typeof countMaioria[x] === "undefined")
                        countMaioria[x] = {};

                    countMaioria[x][data[i].y] = 0;
                }

                dados[x] += parseFloat(data[i].y);
                if (this.operacao === "maioria")
                    countMaioria[x][data[i].y]++;

                count[x]++;
            }

            if (this.operacao === 'media') {
                for (let i in dados)
                    dados[i] = parseFloat(dados[i] / count[i]).toFixed(2);
            }

            if (this.operacao === 'maioria') {
                for (let i in dados) {
                    let maior = "";
                    let maiorv = 0;
                    for (let e in countMaioria[i]) {
                        if (maiorv < countMaioria[i][e]) {
                            maior = e;
                            maiorv = countMaioria[i][e];
                        }
                    }

                    dados[i] = maior;
                }
            }

            /**
             * Constrói os dados de retorno
             */
            for (let i in dados)
                retorno.push({x: i, y: parseFloat(dados[i]).toFixed(this.precision)});

            return retorno;
        }

        findXIfNeed() {
            if ((typeof this.x === "undefined" || isEmpty(this.x)) && ["pie", "donut", "radialBar", "radar"].indexOf(this.type) === -1) {
                /**
                 * Tenta encontrar uma data no primeiro registro, se encontrar, determina o X
                 */
                for (let field in this.data[0]) {
                    if (moment(this.data[0][field], "YYYY-MM-DD[T]HH:mm:ss", true).isValid()) {
                        this.x = field;
                        break;
                    } else if (moment(this.data[0][field], "YYYY-MM-DD", true).isValid()) {
                        this.x = field;
                        break;
                    }
                }
            }
        }

        findYIfNeed() {
            /**
             * Se for o mesmo valor para x e y, então remove y
             */
            if (this.y === this.x)
                this.y = "";
        }

        /**
         * Converte X,Y para Y, labels
         */
        convertPieFormat(data) {
            let labels = [];
            let dataNova = [];
            for (let i in data) {
                labels.push(data[i].x);
                dataNova.push(parseFloat(data[i].y));
            }

            return [labels, dataNova];
        }

        /**
         * Determina o tipo de dado em X a partir do 1° registro
         */
        findXType() {
            if (typeof this.x === "string" && typeof this.data[0] !== "undefined" && typeof this.data[0][this.x] !== "undefined")
                this.xType = (isNumber(this.data[0][this.x]) ? "numeric" : (moment(this.data[0][this.x], "YYYY-MM-DD", true).isValid() || moment(this.data[0][this.x], "YYYY-MM-DD[T]HH:mm:ss", true).isValid() ? "datetime" : "category"));
        }

        workData() {
            if (typeof this.data !== "undefined" && this.data.constructor === Array && this.data.length > 0) {
                /**
                 * Tem registros
                 */

                this.findXIfNeed();
                this.findYIfNeed();
                this.findXType();
                let dataReady = [];
                let labels = [];

                if (typeof this.y === "string" && !isEmpty(this.y)) {
                    /**
                     * Tem Y value
                     */
                    dataReady = this.getWorkedData();

                    if (["pie", "donut", "radialBar", "radar"].indexOf(this.type) > -1) {
                        let d = this.convertPieFormat(dataReady);
                        labels = d[0];
                        dataReady = d[1];

                        /**
                         * Caso seja radialBar, ajusta valores para campo único
                         */
                        if (this.type === "radialBar") {
                            labels[0] = this.labelY || this.operacao + " do " + labels[0];
                            dataReady[0] = (dataReady[0] > this.maximo ? 100 : parseFloat((dataReady[0] * 100) / this.maximo).toFixed(this.precision));
                            this.setOptions({legend: {show: !1}});
                        }
                    }

                } else {
                    /**
                     * Sem um Y definido, mescla os registros com o mesmo X
                     * a partir dai, faz a soma dos registros
                     */

                    if (typeof this.x !== "undefined" && !isEmpty(this.x)) {
                        this.operacao = 'soma';
                        dataReady = this.getSumData();
                    } else if (this.type === "radialBar") {
                        dataReady[0] = this.data.length;
                        labels = [this.labelY || this.operacao + " do " + this.title];
                        this.setOptions({legend: {show: !1}});
                    }
                }

                let data = {name: this.title, data: dataReady};

                /**
                 * Adiciona os dados ao gráfico
                 */
                if (!isEmpty(dataReady)) {

                    /**
                     * Order data
                     */
                    data.data = orderBy(data.data, 'x');
                    if ((this.reverse && this.xType !== "datetime") || (!this.reverse && this.xType === "datetime"))
                        data.data = data.data.reverse();

                    /**
                     * Check if exist some data
                     */
                    if (typeof this.options.series === "undefined") {
                        /**
                         * Ainda não existe dados no gráfico
                         */
                        this.setOptions({
                            series: [],
                            xaxis: {
                                type: this.xType
                            }
                        });
                        this.options.series.push(data);

                    } else {

                        /**
                         * Verifica se encontra um title igual a nova base de dados
                         * @type {boolean}
                         */
                        let isUpdate = !1;
                        for (let i in this.options.series) {
                            if (this.title === this.options.series[i].name) {
                                if (typeof this.chart !== "undefined")
                                    this.chart.updateSeries([data]);
                                else
                                    this.options.series[i] = data;
                                isUpdate = !0;
                                break;
                            }
                        }

                        /**
                         * Se não for atualizaçãod dos dados atuais e o X for linha do tempo
                         * então adicona os dados como uma gráfico a parte
                         */
                        if (!isUpdate && this.xType === "datetime") {

                            /**
                             * Verifica se o gráfico já existe para fazer um append
                             * ou se já inclui direto nos dados mistos
                             */
                            if (typeof this.chart !== "undefined")
                                this.chart.appendSeries(data);
                            else
                                this.options.series.push(data);
                        }
                    }
                } else {
                    if (typeof this.options.series === "undefined") {
                        /**
                         * Ainda não existe dados no gráfico
                         */
                        this.setOptions({
                            series: [],
                            xaxis: {
                                type: this.xType
                            }
                        });

                    } else {
                        this.options.series.push(data);
                    }
                }

                /**
                 * Seta as options para o eixo X trabalhar com data se precisar
                 */
                if (this.xType === "datetime") {
                    this.setOptions({
                        xaxis: {
                            labels: {
                                datetimeFormatter: {
                                    year: 'yyyy',
                                    month: 'MMM',
                                    day: 'dd MMM',
                                    hour: 'HH:mm'
                                }
                            }
                        }
                    });
                }

                /**
                 * Caso tenha labels, muda o formato para pie
                 */
                if (!isEmpty(labels)) {
                    if (["radialBar", "pie", "donut"].indexOf(this.type) > -1)
                        this.setOptions({series: this.options.series[0].data, labels: labels});
                    else if (this.type === "radar")
                        this.setOptions({xaxis: {categories: labels, type: "category"}});
                    else
                        this.setOptions({labels: labels});
                }
            }
            this.workOptions();
            this.workDataDonut();
        }

        workOptions() {
            if(!isEmpty(this.minimoY)) {
                this.setOptions({
                    yaxis: {
                        min: this.minimoY
                    }
                });
            }
            if(!isEmpty(this.maximoY)) {
                this.setOptions({
                    yaxis: {
                        max: this.maximoY
                    }
                });
            }

            if(this.minimoX !== false && !isEmpty(this.minimoX) && this.xType !== "category") {
                this.setOptions({
                    xaxis: {
                        min: (this.xType === "datetime" ? (["now", "today", "hoje", "agora"].indexOf(this.minimoX) > -1 ? new Date().getTime() : new Date(this.minimoX).getTime()) : this.minimoX)
                    }
                });
            }
            if(this.minimoX !== false && !isEmpty(this.maximoX) && this.xType !== "category") {
                this.setOptions({
                    xaxis: {
                        max: (this.xType === "datetime" ? (["now", "today", "hoje", "agora"].indexOf(this.minimoX) > -1 ? new Date().getTime() : new Date(this.minimoX).getTime()) : this.maximoX)
                    }
                });
            }

            this.setOptions({
                legend: {
                    show: this.legendShow
                }
            });
        }

        workDataDonut() {
            if (this.type === "donut") {
                this.setOptions({
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        fontFamily: 'Lato, Roboto, Rubik',
                                        color: '#dfsda',
                                        offsetY: -10
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '28px',
                                        fontFamily: 'Lato, Roboto, Arial, sans-serif',
                                        color: THEME,
                                        offsetY: 16,
                                        formatter: function (val) {
                                            return val
                                        }
                                    },
                                    total: {
                                        show: true,
                                        label: this.labelY || this.title,
                                        color: '#373d3f',
                                        formatter: function (w) {
                                            return w.globals.seriesTotals.reduce((a, b) => {
                                                return a + b
                                            }, 0)
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        /**
         * Mostra o gráfico
         */
        show() {
            this.getOptions().then(options => {
                this.options = options;
                this.chart = new ApexCharts(this.container, this.options);
                this.chart.render();
            });
        }
    };
}