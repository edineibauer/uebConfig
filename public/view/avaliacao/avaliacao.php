<section id="avaliacao">
    <div class="container">
        <div class="row">
            <div class="col-12 pl-2 py-4">
                <a href="#back" class="volta">
                    <i class="material-icons">arrow_back</i>
                </a>
                <h2 class="titulo mb-0" id="avaliacao-title">avaliação</h2>
            </div>
        </div>
        <div class="col-12" id="revision"></div>
        <div class="row sua-avaliacao mt-4 mb-1">
            <div class="col-4">
                <div class="atendimento pt-2">Avaliação</div>
            </div>
            <div class="col-8">
                <div class="estrelas">
                    <input type="radio" id="at-cm-star-empty" name="at" value="" checked/>
                    <label for="at-cm-star-1">
                        <i class="material-icons">star</i>
                    </label>
                    <input type="radio" id="at-cm-star-1" name="at" value="1"/>
                    <label for="at-cm-star-2">
                        <i class="material-icons">star</i>
                    </label>
                    <input type="radio" id="at-cm-star-2" name="at" value="2"/>
                    <label for="at-cm-star-3">
                        <i class="material-icons">star</i>
                    </label>
                    <input type="radio" id="at-cm-star-3" name="at" value="3"/>
                    <label for="at-cm-star-4">
                        <i class="material-icons">star</i>
                    </label>
                    <input type="radio" id="at-cm-star-4" name="at" value="4"/>
                    <label for="at-cm-star-5">
                        <i class="material-icons">star</i>
                    </label>
                    <input type="radio" id="at-cm-star-5" name="at" value="5"/>
                </div>

            </div>
        </div>
        <div class="row">
            <div class="col-12 mt-1">
                <div id="avaliacao-atendimento">
                    <div class="row justify-content-center">
                        <div class="form-group col-12 col-lg-12">
                            <label class="avalicao-atendimento" for="comentario">deixar comentário</label>
                            <textarea class="form-control" id="comentario" rows="6"
                                      name="feedbackTeste"></textarea>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="form-group col-12 col-lg-6">
                            <button id="enviar" type="submit" class="btn theme col py-2">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>