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
            this.funcao = "";
            this.reverse = !1;
            this.groupBy = "day";
            this.options = {};
            this.xType = "datetime";
        }

        setElementTarget(container) {
            this.container = container;
        }

        setData(data, title, y, x, type, funcao, reverse) {
            this.data = data;
            this.title = title || this.title || "";
            this.y = y || this.y || "";
            this.x = x || this.x || "";
            this.type = type || this.type || "bar";
            this.funcao = funcao || this.funcao || "";
            this.reverse = reverse || this.reverse || !1;

            this.workData();
        }

        setTitle(title) {
            this.title = title;
            this.options = Object.assign(this.options || {}, {
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
            this.funcao = operacao;
        }

        setFuncaoSoma() {
            this.funcao = 'soma';
        }

        setFuncaoMaioria() {
            this.funcao = 'maioria';
        }

        setFuncaoMedia() {
            this.funcao = 'media';
        }

        setOptionParam(param) {
            this.options = Object.assign(this.options || {}, param);
        }

        /**
         * Define agrupamento dos dados por hora
         * @param operacao
         */
        setGroupByHour(operacao) {
            this.groupBy = "hour";
            if (typeof operacao !== "undefined")
                this.funcao = operacao;
        }

        /**
         * Define agrupamento dos dados por dia
         * @param operacao
         */
        setGroupByDay(operacao) {
            this.groupBy = "day";
            if (typeof operacao !== "undefined")
                this.funcao = operacao;
        }

        /**
         * Define agrupamento dos dados por semana
         * @param operacao
         */
        setGroupByWeek(operacao) {
            this.groupBy = "week";
            if (typeof operacao !== "undefined")
                this.funcao = operacao;
        }

        /**
         * Define agrupamento dos dados por mês
         * @param operacao
         */
        setGroupByMonth(operacao) {
            this.groupBy = "month";
            if (typeof operacao !== "undefined")
                this.funcao = operacao;
        }

        /**
         * Define agrupamento dos dados por ano
         * @param operacao
         */
        setGroupByYear(operacao) {
            this.groupBy = "year";
            if (typeof operacao !== "undefined")
                this.funcao = operacao;
        }

        /**
         * Retorna opções padrões já definidas
         * @returns {{xaxis: {categories: number[]}, series: [{data, name: string}], chart: {type: (*|string)}}}
         */
        getOptions() {

            /**
             * Faz a leitura dos dados da lingua nativa
             */
            return getJSON(VENDOR + "ecash/public/assets/libs/chartLanguage/pt-br.json").then(language => {

                /**
                 * Monta retorno
                 */
                return Object.assign(this.options || {}, {
                    chart: {
                        // type: this.type,
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
                                reset: true | '<img src="/static/icons/reset.png" width="20">',
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
                toast("Gráfico: Campo Y não existe", 5000, "toast-warning");
                return data;
            }

            if (typeof this.x === "string" && !isEmpty(this.x)) {

                /**
                 * Verifica se o campo X existe
                 */
                if (typeof this.data[0][this.x] === "undefined") {
                    toast("Gráfico: Campo X não existe", 5000, "toast-warning");
                    return data;
                }

                /**
                 * Determina o tipo de dado em X a partir do 1° registro
                 */
                this.xType = (!isNaN(this.data[0][this.x]) ? "numeric" : (moment(this.data[0][this.x], "YYYY-MM-DD", true).isValid() || moment(this.data[0][this.x], "YYYY-MM-DD[T]HH:mm:ss", true).isValid() ? "datetime" : "category"));
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
                /**
                 * Valor Solo, Y
                 */
                for (let i in this.data) {
                    data.push(this.data[i][this.y]);
                }
            }

            /**
             * Aplica a função de Soma, Média ou Maioria
             */
            // data = this.exeGroup(data, isDataTimeComplete);
            data = this.exeFuncao(data, isDataTimeComplete);

            console.log(data);

            return data;
        }

        /**
         * Retorna a soma dos registros com base no eixo X
         */
        getSumData() {
            let count = {};
            for (let i in this.data) {
                let x = this.data[i][this.x];
                if (typeof count[x] === "undefined")
                    count[x] = 0;

                count[x]++;
            }

            let data = [];
            for (let x in count) {
                data.push({
                    x: x,
                    y: count[x]
                });
            }

            this.xType = (!isNaN(this.data[0][this.x]) ? "numeric" : (moment(this.data[0][this.x], "YYYY-MM-DD", true).isValid() || moment(this.data[0][this.x], "YYYY-MM-DD[T]HH:mm:ss", true).isValid() ? "datetime" : "category"));

            return data;
        }

        /**
         * Agrupa os dados pelo this.groupBy definido, padrão dia
         * @param data
         * @param isDateTimeComplete
         * @returns {*}
         */
        exeGroup(data, isDateTimeComplete) {
            if (this.xType !== "datetime")
                return data;

            let countHelper = 1;
            let dataGrouped = {};
            for (let i in data) {
                let xData = "";

                if (this.groupBy === "hour") {
                    xData = (isDateTimeComplete ? moment(data[i].x).format("YYYY-MM-DD hh:mm:ss") : moment(data[i].x).format("YYYY-MM-DD") + zeroEsquerda(countHelper) + ":00:00");
                    countHelper++;
                } else if (this.groupBy === "day") {
                    xData = moment(data[i].x).format("YYYY-MM-DD");
                } else if (this.groupBy === "week") {
                    xData = moment(data[i].x).week();
                } else if (this.groupBy === "month") {
                    xData = moment(data[i].x).month();
                } else {
                    xData = moment(data[i].x).year();
                }

                if (typeof dataGrouped[xData] === "undefined")
                    dataGrouped[xData] = 0;

                dataGrouped[xData] += parseFloat(data[i].y);
            }

            let dataReturn = [];
            for (let i in dataGrouped)
                dataReturn.push({x: i, y: dataGrouped[i]});

            return dataReturn;
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

            if ((this.funcao === 'soma' || this.funcao === 'media') && isNaN(data[0].y)) {
                toast("Gráfico: Soma ou Média necessita valores numéricos no campo Y", 6000, "toast-warning");
                return retorno;
            }

            if (this.funcao === 'soma' || this.funcao === 'media' || this.funcao === 'maioria') {

                for (let i in data) {
                    let x = "";
                    let countHelper = 1;

                    if (this.groupBy === "hour") {
                        x = (isDataTimeComplete ? moment(data[i].x).format("YYYY-MM-DD hh:mm:ss") : moment(data[i].x).format("YYYY-MM-DD") + zeroEsquerda(countHelper) + ":00:00");
                        countHelper++;
                    } else if (this.groupBy === "day") {
                        x = moment(data[i].x).format("YYYY-MM-DD");
                    } else if (this.groupBy === "week") {
                        x = moment(data[i].x).day("Sunday").format("YYYY-MM-DD");
                    } else if (this.groupBy === "month") {
                        x = moment(data[i].x).format("YYYY-MM-[01]");
                    } else {
                        x = moment(data[i].x).format("YYYY-[01]-[01]");
                    }

                    if (typeof dados[x] === "undefined") {
                        dados[x] = 0.0;
                        count[x] = 0;
                        if (typeof countMaioria[x] === "undefined")
                            countMaioria[x] = {};

                        countMaioria[x][data[i].y] = 0;
                    }

                    dados[x] += parseFloat(data[i].y);
                    if (this.funcao === "maioria")
                        countMaioria[x][data[i].y]++;

                    count[x]++;
                }

                if (this.funcao === 'media') {
                    for (let i in dados)
                        dados[i] = parseFloat(dados[i] / count[i]).toFixed(2);
                }

                if (this.funcao === 'maioria') {
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
                    retorno.push({x: i, y: parseFloat(dados[i]).toFixed(1)});

            } else {

                retorno = data;
            }

            return retorno;
        }

        findXIfNeed() {
            if (typeof this.x === "undefined" || isEmpty(this.x)) {
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

        workData() {
            if (typeof this.data !== "undefined" && this.data.constructor === Array && this.data.length > 0) {
                /**
                 * Tem registros
                 */

                this.findXIfNeed();
                let dataReady = [];
                if (typeof this.y === "string" && !isEmpty(this.y)) {
                    /**
                     * Tem Y value
                     */
                    dataReady = this.getWorkedData();

                } else {
                    /**
                     * Sem um Y definido, mescla os registros com o mesmo X
                     * a partir dai, faz a soma dos registros
                     */

                    if (typeof this.x !== "undefined" && !isEmpty(this.x)) {
                        this.funcao = 'soma';
                        dataReady = this.getSumData();
                    }
                }

                let data = {name: this.title, type: this.type, data: dataReady};

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
                        this.options = Object.assign(this.options || {}, {
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
                        this.options = Object.assign(this.options || {}, {
                            series: [],
                            xaxis: {
                                type: this.xType
                            }
                        });

                    } else {
                        this.options.series.push(data);
                    }
                }

                if (this.xType === "datetime") {
                    this.options.xaxis.labels = {
                        datetimeFormatter: {
                            year: 'yyyy',
                            month: 'MMM',
                            day: 'dd MMM',
                            hour: 'HH:mm'
                        }
                    }
                }
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