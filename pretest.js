// verify MapboxAccessToken loaded into environment
process.stderr.write('Checking for MapboxAccessToken...')
if(!process.env.MapboxAccessToken) {
    process.stderr.write('FAILED.\n  => run `export MapboxAccessToken=<token>`\n');
    process.exit(1);
}
process.stderr.write('OK.\n');