const bcrypt = require('bcrypt');
const { ClienteModel } = require('../models/clienteModel');

class UserService {

    validarSenha(senha) {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!*@#$%^&(),.?":{}|<>_\-+=~`\[\]\/]).{8,}$/;
        return regex.test(senha);
    }

    async cadastrarCliente(dados) {
        const { nome, dataNascimento, cpf, genero, telefone, email, senha, enderecos, cartoes } = dados;
        if (!nome) throw { status: 400, mensagem: 'O nome do cliente é obrigatório.' };
        if (!dataNascimento) throw { status: 400, mensagem: 'A data de nascimento é obrigatória.' };
        if (!cpf) throw { status: 400, mensagem: 'O CPF é obrigatório.' };
        if (!genero) throw { status: 400, mensagem: 'O gênero é obrigatório.' };
        if (!telefone) throw { status: 400, mensagem: 'O telefone é obrigatório.' };
        if (!email) throw { status: 400, mensagem: 'O e-mail é obrigatório.' };
        if (!senha) throw { status: 400, mensagem: 'A senha é obrigatória.' };

        if (!this.validarSenha(senha)) {
            throw { status: 400, mensagem: 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e caractere especial.' };
        }

        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            throw { status: 400, mensagem: 'CPF inválido.' };
        }

        if (!enderecos || enderecos.length === 0) {

            throw { status: 400, mensagem: 'É necessario informar ao menos um endereço' };

        }

        for (const endereco of enderecos) {
            if (!endereco.tipoResidencia) throw { status: 400, mensagem: "Tipo de residência é obrigatório" };
            if (!endereco.cep) throw { status: 400, mensagem: "O CEP é obrigatório" };
            if (!endereco.tipoLogradouro) throw { status: 400, mensagem: "Tipo de logradouro é obrigatório" };
            if (!endereco.cidade) throw { status: 400, mensagem: "A cidade é obrigatória" };
            if (!endereco.pais) throw { status: 400, mensagem: "O país é obrigatório" };
            if (!endereco.estado) throw { status: 400, mensagem: "O estado é obrigatório" };
            if (!endereco.bairro) throw { status: 400, mensagem: "O bairro é obrigatório" };
            if (!endereco.logradouro) throw { status: 400, mensagem: "O lougradouro é obrigatório" };
            if (!endereco.nomeEndereco) throw { status: 400, mensagem: "O nome do endereço é obrigatório" };
            if (!endereco.numero) throw { status: 400, mensagem: "O número é obrigatório" };
            if (!endereco.tipoEndereco) throw { status: 400, mensagem: "O tipo de endereço é obrigatório" };
        }

        let enderecosCobranca = enderecos.filter(e => e.tipoEndereco === 'C');
        if (enderecosCobranca.length === 0) {
            throw { status: 400, mensagem: 'É necessário informar ao menos um endereço de cobrança' };
        }

        enderecosCobranca = enderecos.filter(e => e.tipoEndereco === 'E');
        if (enderecosCobranca.length === 0) {
            throw { status: 400, mensagem: 'É necessário informar ao menos um endereço de entrega' };
        }

        if (!cartoes || cartoes.length === 0) {
            throw { status: 400, mensagem: 'É necessário informar ao menos um cartão de crédito' };
        }
        for (const cartao of cartoes) {
            if (!cartao.numeroCartao) throw { status: 400, mensagem: "O numero do cartão é obrigatório" };
            if (!cartao.bandeiraCartao) throw { status: 400, mensagem: "A bandeira do cartão é obrigatório" };
            if (!cartao.nomeCartao) throw { status: 400, mensagem: "O nome no cartão é obrigatório" };
            if (!cartao.cvv) throw { status: 400, mensagem: "O código de segurança do cartão é obrigatório" };
        }

        const preferencial = cartoes.filter(c => c.preferencial === true);
        if (preferencial.length !== 1) {
            throw { status: 400, mensagem: 'Deve haver apenas um cartão marcado como preferencial' };

        }

        const clienteModel = new ClienteModel();

        
        /*const cpfCadastrado = clienteModel.buscarCpf(cpfLimpo);
        if(cpfCadastrado){
            throw { status: 409, mensagem: "CPF já cadastrado"};
        }


        const telefoneCadastrado = clienteModel.buscarTelefone(telefone);
        if(telefoneCadastrado){
            throw { status: 409, mensagem: "Telefone já cadastrado"};
        }
        
    
        const emailCadastrado = clienteModel.buscaremail(email);
        if(emailCadastrado){
            throw { status: 409, mensagem: "E-mail já cadastrado"};
        }*/

        
        const parsedDataNasc = new Date(dataNascimento);
        if (isNaN(parsedDataNasc.getTime())) {
            throw new { status: 400, mensagem: 'Data de nascimento inválida' }
        }

        const hoje = new Date();
        if (parsedDataNasc >= hoje) {
            throw new { status: 400, mensagem: 'Data de nascimento não pode ser futura' };
        }

        const hashSenha = await bcrypt.hash(senha, 10);

        return clienteModel.criarCliente({
            nome,
            dataNascimento: parsedDataNasc,
            cpf: cpfLimpo,
            genero,
            telefone,
            email,
            senha: hashSenha,
            enderecos,
            cartoes
        });

    }



}




module.exports = { UserService };