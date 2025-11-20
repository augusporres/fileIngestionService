export async function parseLine(line: string): Promise<any> {
    const fields = line.split('|');
        
    if (fields.length !== 7) {        
        throw new Error(`Línea malformada: se esperaban 7 campos, pero se recibieron ${fields.length}`);
    }
    let [name, lastName, docStr, status, ingressDateStr, isPEPstr, isObligatedSubjectStr] = fields;
    
    // limit name + lastName to be valid nvarchar(100)
    if ( (name + lastName).length === 0) {
        throw new Error('Name and LastName cannot be empty');
    } 
    
    // Combine with space first, then truncate to exactly 100 chars
    let fullName = name + ' ' + lastName;
    if (fullName.length > 100) {
        console.warn('Full name too long, truncating', { fullName });
        fullName = fullName.substring(0, 100);
    }
    if (docStr.length === 0 || isNaN(parseInt(docStr, 10))) {
        throw new Error(`Invalid Document: ${docStr}`);
    }
    if (status !== 'Activo' && status !== 'Inactivo') {
        throw new Error(`Invalid Status: ${status}`);
    }
    if (isNaN(Date.parse(ingressDateStr))) {
        throw new Error(`Invalid ingress date: ${ingressDateStr}`);
    }
    if (isPEPstr.toLowerCase() !== 'true' && isPEPstr.toLowerCase() !== 'false' && isPEPstr !== '1' && isPEPstr !== '0') {
        throw new Error(`Invalid value for isPEP: ${isPEPstr}`);
    }
    // Validar DNI?
    return {
        fullName: fullName,
        document: parseInt(docStr, 10),
        status: status,
        ingressDate: new Date(ingressDateStr),
        isPEP: isPEPstr.toLowerCase() === 'true' || isPEPstr === '1',
        isObligatedSubject: isObligatedSubjectStr.toLowerCase() === 'true' || isObligatedSubjectStr === '1'

    }
}