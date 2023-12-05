const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.listen(process.env.PORT, () => {
 console.log(`Server is listening on port ${process.env.PORT}`);
});
