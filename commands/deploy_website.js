const {
    feeconfirmation,
    buildHostingTransaction,
    buildtxn,
    sendtxn,
    buildTransferTransaction,
    getTransactionIndex,
    folder_waitConfirmations,
    website_waitConfirmations
} = require('../lib/transaction_builder')
const {
    list_files_dir,
    generate_seed_and_address_for_every_file,
    generate_seed_and_address,
    replace_file_paths_to_transaction_url
} = require('../lib/file_management')
const chalk = require('chalk')
const algo = 'sha256'
let Files = []
let Seed = []
let Address = []
let array_files = []
let array_address = []
let index

exports.command = 'deploy-website'

exports.describe = 'Deploy all files inside folder and target index.html file to automatically convert filepaths to transactions'

exports.builder = {
    seed: {
        describe: 'Seed is a string representing the transaction chain entropy to be able to derive and generate the keys for the transactions',
        demandOption: true, // Required
        type: 'string'
    },

    endpoint: {
        describe: 'Endpoint is the URL of a welcome node to receive the transaction',
        demandOption: true, // Required
        type: 'string'
    },

    folder: {
        describe: 'Folder is the name of folder',
        demandOption: true, // Required
        type: 'string'
    }
}

exports.handler = async function (argv) {

    list_files_dir(argv.folder, Files)

    generate_seed_and_address_for_every_file(Files, algo, argv.seed, Seed, Address)

    buildTransferTransaction(Address, argv.seed)

    await sendtxn(txn, argv.endpoint)


    for (let i = 0; i < Files.length; i++) {

        x = Files[i]
        let seed = generate_seed_and_address(x, algo, argv.seed).seed
        let address = generate_seed_and_address(x, algo, argv.seed).address

        buildHostingTransaction(Files[i])

        index = await getTransactionIndex(address, argv.endpoint)

        buildtxn(seed, index)

        try {

            const ok = await feeconfirmation(transaction, argv.endpoint)

            if (ok) {

                x = Files[i]

                folder_waitConfirmations(transaction, address, argv.endpoint, x)

                await sendtxn(transaction, argv.endpoint)

                array_files.push((Files[i].substring(Files[i].indexOf('/') + 1)))
                array_address.push(address)
            }


        } catch (e) {
            console.error(chalk.red(e.message))
            return
        }

    }

    for (let i = 0; i < array_files.length; i++) {
        if ((array_files[i] == 'index.html')) {

            await replace_file_paths_to_transaction_url(argv.folder, array_files, array_address, argv.endpoint)

            y = argv.folder + "/index.html"

            let seed = generate_seed_and_address(y, algo, argv.seed).seed

            let address = generate_seed_and_address(y, algo, argv.seed).address

            buildHostingTransaction(argv.folder + "/index.html")

            index = await getTransactionIndex(address, argv.endpoint)

            buildtxn(seed, index)

            try {

                const ok = await feeconfirmation(transaction, argv.endpoint)

                if (ok) {

                    x = Files[i]

                    website_waitConfirmations(transaction, address, argv.endpoint, x)

                    await sendtxn(transaction, argv.endpoint)
                }

            } catch (e) {
                console.error(chalk.red(e.message))
                return
            }
        }
    }
}