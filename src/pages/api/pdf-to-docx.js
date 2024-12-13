import ConvertAPI from 'convertapi';

const convertapi = new ConvertAPI(process.env.CONVERT_API_SECRET, { conversionTimeout: 60 });

export default async function handler(req, res) {
    try {
        const { url } = req.body;

        convertapi.convert('docx', {
            File: url
        }, 'pdf').then(function (result) {
            // result.saveFiles('/path/to/dir');
            res.json({ result: result.response.Files[0] })
        }).catch(err => {
            console.error("XXXXXXXXXXXXXXXXXXXXXXXXX:", err);
        })

    } catch (error) {
        console.error("Conversion error:", error);
        res.status(500).json({ error: "File conversion failed." });
    }
}
