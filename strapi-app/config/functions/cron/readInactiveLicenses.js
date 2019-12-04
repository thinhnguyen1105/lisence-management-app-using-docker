
const readInactiveLicenses = async () => {
    const promises = [];
    const allLicenses = await strapi.services.license.fetchAll();
    const date = new Date();
    const currentDate = date.getTime();
    let count = 0;
    allLicenses.forEach((value) => {
        if (value.expriedDate) {
            if (value.expriedDate < currentDate) {
                promises.push(strapi.services.license.edit({ _id: value._id }, { isActive: false }));
                count++;
            }
        } else {
            promises.push(strapi.services.license.edit({ _id: value._id }, { isActive: false }));
            count++
        }
    })
    try {
        await Promise.all(promises);
        strapi.log.info(`Done update ${count} inactive licenses`);
    } catch (err) {
        console.log('err', err)
    }
}

module.exports = {
    readInactiveLicenses,
}
