const { EnderecoModel } = require('../models/enderecoModel');

class EnderecoService {
    async alterarEndereco(enderecoId, dados) {

        const { cliId, tipoResidencia, cep, tipoLogradouro, cidade, pais, estado, bairro, logradouro, nomeEndereco, numero, tipoEndereco } = dados

        if (!tipoResidencia) throw { status: 400, mensagem: "Tipo de residência é obrigatório" };
        if (!cep) throw { status: 400, mensagem: "O CEP é obrigatório" };
        if (!tipoLogradouro) throw { status: 400, mensagem: "Tipo de logradouro é obrigatório" };
        if (!cidade) throw { status: 400, mensagem: "A cidade é obrigatória" };
        if (!pais) throw { status: 400, mensagem: "O país é obrigatório" };
        if (!estado) throw { status: 400, mensagem: "O estado é obrigatório" };
        if (!bairro) throw { status: 400, mensagem: "O bairro é obrigatório" };
        if (!logradouro) throw { status: 400, mensagem: "O lougradouro é obrigatório" };
        if (!nomeEndereco) throw { status: 400, mensagem: "O nome do endereço é obrigatório" };
        if (!numero) throw { status: 400, mensagem: "O número é obrigatório" };
        if (!tipoEndereco) throw { status: 400, mensagem: "O tipo de endereço é obrigatório" };

        if (!(tipoEndereco === 'C' || tipoEndereco === 'E')) {
            throw { status: 400, mensagem: 'É necessário definir se o endereço é de cobrança ou de entrega' }
        };

        const model = new EnderecoModel();
        const editado = await model.alterar(enderecoId, cliId, dados);

        if (!editado) {
            throw { status: 404, mensagem: 'Endereço não encontrado.' };

        }

        return model.buscarId(enderecoId, cliId);
    }

    async cadastrarEndereco(dados){
        const { cliId, tipoResidencia, cep, tipoLogradouro, cidade, pais, estado, bairro, logradouro, nomeEndereco, numero, tipoEndereco } = dados

        if (!tipoResidencia) throw { status: 400, mensagem: "Tipo de residência é obrigatório" };
        if (!cep) throw { status: 400, mensagem: "O CEP é obrigatório" };
        if (!tipoLogradouro) throw { status: 400, mensagem: "Tipo de logradouro é obrigatório" };
        if (!cidade) throw { status: 400, mensagem: "A cidade é obrigatória" };
        if (!pais) throw { status: 400, mensagem: "O país é obrigatório" };
        if (!estado) throw { status: 400, mensagem: "O estado é obrigatório" };
        if (!bairro) throw { status: 400, mensagem: "O bairro é obrigatório" };
        if (!logradouro) throw { status: 400, mensagem: "O lougradouro é obrigatório" };
        if (!nomeEndereco) throw { status: 400, mensagem: "O nome do endereço é obrigatório" };
        if (!numero) throw { status: 400, mensagem: "O número é obrigatório" };
        if (!tipoEndereco) throw { status: 400, mensagem: "O tipo de endereço é obrigatório" };

        if (!(tipoEndereco === 'C' || tipoEndereco === 'E')) {
            throw { status: 400, mensagem: 'É necessário definir se o endereço é de cobrança ou de entrega' }
        };

        const model = new EnderecoModel();
        return model.cadastrar(dados, {
            tipoResidencia,
            cep,
            tipoLogradouro,
            cidade,
            pais,
            estado,
            bairro,
            logradouro,
            nomeEndereco,
            numero,
            tipoEndereco
        });
        
    }

    async listar(cliId) {
        if (!cliId) {
            throw { status: 400, mensagem: 'O id do cliente é obrigatório.' };
        }

        const model = new EnderecoModel();
        return model.listar(cliId);
    }

    async buscarPorId(cliId, id) {
        if (!cliId) {
            throw { status: 400, mensagem: 'O id do cliente é obrigatório.' };
        }

        const model = new EnderecoModel();
        return model.buscarId(id, cliId);
    }

    async deletar(cliId, id) {
        const model = new EnderecoModel();
        const endereco = await model.buscarId(id, cliId);

        if (!endereco) {
            throw { status: 404, mensagem: 'Endereço não encontrado.' };
        }

        return model.deletar(cliId, id);
    }
}

module.exports = { EnderecoService };