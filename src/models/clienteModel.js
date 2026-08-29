const pool = require('../config/database');

class ClienteModel {
    async criarCliente(dados) {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const cpfCadastrado = await this.buscarCpf(conexao, dados.cpf);
            if (cpfCadastrado){
                throw { status: 409, mensagem: "CPF já cadastrado"};
            }

            const emailCadastrado = await this.buscarEmail(conexao, dados.email)
            if (emailCadastrado){
                throw { status: 409, mensagem: "Email já cadastrado" }; 
            }
            
            const telefoneCadastrado = await this.buscarTelefone(conexao, dados.telefone);
            if (telefoneCadastrado){
                throw { status: 409, mensagem: "Telefone já cadastrado"};
            }
            
            const cliId = await this.inserirCliente(conexao, dados);
            await this.inserirEnderecos(conexao, cliId, dados.enderecos);
            await this.inserirCartoes(conexao, cliId, dados.cartoes);
            

            await conexao.commit();
            return cliId;
        } catch (error) {
            await conexao.rollback();
            console.log(error);
            throw error;

        } finally {
            conexao.release();
        }
    }

    async inserirCliente(conexao, dados) {
        const [resultado] = await conexao.execute(`INSERT INTO cliente
        (cli_nome, cli_genero, cli_dataNasc, cli_cpf, cli_telefone, cli_email, cli_hashSenha, cli_ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.nome,
                dados.genero,
                dados.dataNascimento,
                dados.cpf,
                dados.telefone,
                dados.email,
                dados.senha,
                true
            ]
        );

        return resultado.insertId;
    }

    async inserirEnderecos(conexao, clidId, enderecos) {
        for (const endereco of enderecos) {
            await conexao.execute(
                `INSERT INTO endereco
                (end_cli_id, end_tipoEndereco, end_tipoResidencia, end_tipoLogradouro, end_logradouro, end_numero, end_bairro, end_cep, end_cidade, end_estado, end_pais, end_complemento, end_nomeEndereco)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    clidId,
                    endereco.tipoEndereco,
                    endereco.tipoResidencia,
                    endereco.tipoLogradouro,
                    endereco.logradouro,
                    endereco.numero,
                    endereco.bairro,
                    endereco.cep,
                    endereco.cidade,
                    endereco.estado,
                    endereco.pais,
                    endereco.complemento || null,
                    endereco.nomeEndereco
                ]
            )
        }
    }

    async inserirCartoes(conexao, cliId, cartoes) {
        for (const cartao of cartoes) {
            if (cartao.preferencial) {
                await conexao.execute(
                'UPDATE cartao SET car_preferencial = false WHERE car_cli_id = ?',
                [cliId]
                );
            }

            await conexao.execute(
                `INSERT INTO cartao
                (car_cli_id, car_bdr_id, car_numero, car_nomeImpresso, car_cvv, car_preferencial)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    cliId,
                    cartao.bandeiraCartao,
                    cartao.numeroCartao,
                    cartao.nomeCartao,
                    cartao.cvv,
                    cartao.preferencial || false,
                ]
            );
        }
    }

    async buscarCpf(conexao, cpf){
        const [linhas] = await conexao.execute('SELECT * FROM cliente WHERE cli_cpf = ?', [cpf]);
        return linhas[0];    
    }

    async buscarEmail(conexao, email){
        const [linhas] = await conexao.execute('SELECT * FROM cliente WHERE cli_email = ?', [email]);
        return linhas[0];    
    }

    async buscarTelefone(conexao, telefone){
        const [linhas] = await conexao.execute('SELECT * FROM cliente WHERE cli_telefone = ?', [telefone]);
        return linhas[0];    
    }
}

module.exports = { ClienteModel };