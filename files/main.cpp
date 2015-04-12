#include <iostream>
#include <fstream>
#include <algorithm>
#include <string>
#include "zlib.h"
#include <openssl/aes.h>
#include <stdexcept>

using namespace std;

void compress_one_file(char *infilename, char *outfilename);
void encrypt_one_file(char *_inFileName, char *_outFileName, string _keyFilename);
void decrypt_one_file(char *_inFileName, char *_outFileName, string _keyFilename);
void decompress_one_file(char *infilename, char *outfilename);

vector<string> splitFiles( string _fileName ) {

	vector<string> _newFileNames;

	string _rawname = _fileName.substr(0, _fileName.find_last_of("."));

	char * buffer;

	static int fileSize;
	static int numParts = 3;
	static int maxBufferSize = 1024;

	std::ifstream in(_fileName, std::ifstream::ate | std::ifstream::binary);
	fileSize = in.tellg();
	//cout << "File size is " << fileSize << endl;

	for ( int i = 0 ; i < numParts ; i++ ) {
		_newFileNames.push_back("parts/" + _rawname + "_" + to_string(i) + ".split");

		ofstream outfile ( _newFileNames.at(i), std::ofstream::ate | ofstream::binary);
		int totalRead = 0;
		int partSize = ceil((float)fileSize / numParts);
		//cout << "Part size is " << partSize << endl;

		while (totalRead < partSize)
		{
			int size = min(maxBufferSize, partSize);
			buffer = new char [size];
			in.seekg(partSize * i + totalRead);
			//cout << partSize * i + totalRead << endl;

			in.read( buffer, size);

			totalRead += size;

			outfile.write((char*) buffer, size);

			//cout << "done" << endl;
		}
		outfile.close();

	}
	in.close();

	return _newFileNames;

}

vector<string> compress_files(vector<string> files) {
	vector<string> compressedFiles;
	for (unsigned int i = 0 ; i < files.size(); i++) {
		char *readable = new char[files[i].size() + 1];
		std::copy(files[i].begin(), files[i].end(), readable);
		readable[files[i].size()] = '\0';

		string _rawname = files[i].substr(0, files[i].find_first_of("."));
		string outPath = _rawname + ".compressed";
		compressedFiles.push_back(outPath);
		char *writeable = new char[outPath.size() + 1];
		std::copy(outPath.begin(), outPath.end(), writeable);
		writeable[outPath.size()] = '\0';
		compress_one_file(readable, writeable);
	}
	return compressedFiles;
}

vector<string> decompress_files(vector<string> files) {
	vector<string> decompressedFiles;
	for (unsigned int i = 0 ; i < files.size(); i++) {
		char *readable = new char[files[i].size() + 1];
		std::copy(files[i].begin(), files[i].end(), readable);
		readable[files[i].size()] = '\0';

		string _rawname = files[i].substr(0, files[i].find_first_of("."));
		string outPath = _rawname + ".decompressed";
		decompressedFiles.push_back(outPath);
		char *writeable = new char[outPath.size() + 1];
		std::copy(outPath.begin(), outPath.end(), writeable);
		writeable[outPath.size()] = '\0';
		decompress_one_file(readable, writeable);
	}
	return decompressedFiles;
}

vector<string> encrypt_files(vector<string> files, string _keyFilename) {
	vector<string> encryptedFiles;
	for (unsigned int i = 0 ; i < files.size(); i++) {
		char *readable = new char[files[i].size() + 1];
		std::copy(files[i].begin(), files[i].end(), readable);
		readable[files[i].size()] = '\0';

		string _rawname = files[i].substr(0, files[i].find_first_of("."));
		string outPath = _rawname + ".encrypted";
		encryptedFiles.push_back(outPath);
		char *writeable = new char[outPath.size() + 1];
		std::copy(outPath.begin(), outPath.end(), writeable);
		writeable[outPath.size()] = '\0';
		encrypt_one_file(readable, writeable, _keyFilename);
	}
	return encryptedFiles;
}

vector<string> decrypt_files(vector<string> files, string _keyFileName) {
	vector<string> encryptedFiles;
	for (unsigned int i = 0 ; i < files.size(); i++) {
		char *readable = new char[files[i].size() + 1];
		std::copy(files[i].begin(), files[i].end(), readable);
		readable[files[i].size()] = '\0';

		string _rawname = files[i].substr(0, files[i].find_first_of("."));
		string outPath = _rawname + ".decryted";
		encryptedFiles.push_back(outPath);
		char *writeable = new char[outPath.size() + 1];
		std::copy(outPath.begin(), outPath.end(), writeable);
		writeable[outPath.size()] = '\0';
		decrypt_one_file(readable, writeable, _keyFileName);
	}
	return encryptedFiles;
}


unsigned long file_size(char *filename)
{
	FILE *pFile = fopen(filename, "rb");
	fseek (pFile, 0, SEEK_END);
	unsigned long size = ftell(pFile);
	fclose (pFile);
	return size;
}

void compress_one_file(char *infilename, char *outfilename)
{
	FILE *infile = fopen(infilename, "rb");
	gzFile outfile = gzopen(outfilename, "wb");
	if (!infile || !outfile) return;

	char inbuffer[128];
	int num_read = 0;
	unsigned long total_read = 0;
	while ((num_read = fread(inbuffer, 1, sizeof(inbuffer), infile)) > 0) {
		total_read += num_read;
		gzwrite(outfile, inbuffer, num_read);
	}
	fclose(infile);
	gzclose(outfile);

	printf("Read %ld bytes, Wrote %ld bytes, Compression factor %4.2f%%\n",
	       total_read, file_size(outfilename),
	       (1.0 - file_size(outfilename) * 1.0 / total_read) * 100.0);


}

void decompress_one_file(char *infilename, char *outfilename)
{
	gzFile infile = gzopen(infilename, "rb");
	FILE *outfile = fopen(outfilename, "wb");
	if (!infile || !outfile) return;
	gzrewind(infile);
	while (!gzeof(infile))
	{
		char outbuffer[128];
		int len = gzread(infile, outbuffer, sizeof(outbuffer));
		fwrite( outbuffer, sizeof(char), len, outfile);
	}

	fclose(outfile);
	gzclose(infile);
	/*
		printf("Read %ld bytes, Wrote %ld bytes, Decompression factor %4.2f%%\n",
		       total_read, file_size(outfilename),
		       (1.0 - file_size(outfilename) * 1.0 / total_read) * 100.0);
	*/

}

void encrypt_one_file(char *_inFileName, char *_outFileName, string _keyFilename) {
    
	FILE *pInFile ;
	FILE *pOutFile ;
	pInFile = fopen(_inFileName, "rb");
	pOutFile = fopen(_outFileName, "wb");
	std::ifstream keyInput( _keyFilename );

	int bytes_read, bytes_written;
	unsigned char indata[AES_BLOCK_SIZE];
	unsigned char outdata[AES_BLOCK_SIZE];

	string line ;

	getline( keyInput, line, '\0' );
	unsigned char *ckey = new unsigned char[line.size() + 1];
	copy(line.begin(), line.end(), ckey);
	ckey[line.size()] = '\0';

	getline( keyInput, line, '\0' );
	unsigned char *ivec = new unsigned char[line.size() + 1];
	copy(line.begin(), line.end(), ivec);
	ivec[line.size()] = '\0';
    
    
	/* ckey and ivec are the two 128-bits keys necesary to
	   en- and recrypt your data.  Note that ckey can be
	   192 or 256 bits as well */


	/* data structure that contains the key itself */
	AES_KEY key;

	/* set the encryption key */
	AES_set_encrypt_key(ckey, 128, &key);

	/* set where on the 128 bit encrypted block to begin encryption*/
	int num = 0;

	while (1) {

		bytes_read = fread(indata, 1, AES_BLOCK_SIZE, pInFile);

		AES_cfb128_encrypt(indata, outdata, bytes_read, &key, ivec, &num,
		                   AES_ENCRYPT);

		bytes_written = fwrite(outdata, 1, bytes_read, pOutFile);
		if (bytes_read < AES_BLOCK_SIZE)
			break;
	}
	fclose(pInFile);
	fclose(pOutFile);

}

void decrypt_one_file(char *_inFileName, char *_outFileName, string _keyFilename) {

	FILE *pInFile ;
	FILE *pOutFile ;
	pInFile = fopen(_inFileName, "rb");
	pOutFile = fopen(_outFileName, "wb");
	std::ifstream keyInput( _keyFilename );

	int bytes_read, bytes_written;
	unsigned char indata[AES_BLOCK_SIZE];
	unsigned char outdata[AES_BLOCK_SIZE];

	/* ckey and ivec are the two 128-bits keys necesary to
	   en- and recrypt your data.  Note that ckey can be
	   192 or 256 bits as well */

	string line ;

	getline( keyInput, line, '\0' );
	unsigned char *ckey = new unsigned char[line.size() + 1];
	copy(line.begin(), line.end(), ckey);
	ckey[line.size()] = '\0';

	getline( keyInput, line, '\0' );
	unsigned char *ivec = new unsigned char[line.size() + 1];
	copy(line.begin(), line.end(), ivec);
	ivec[line.size()] = '\0';

	/* data structure that contains the key itself */
	AES_KEY key;

	/* set the encryption key */
	AES_set_encrypt_key(ckey, 128, &key);

	/* set where on the 128 bit encrypted block to begin encryption*/
	int num = 0;

	while (1) {
		bytes_read = fread(indata, 1, AES_BLOCK_SIZE, pInFile);

		AES_cfb128_encrypt(indata, outdata, bytes_read, &key, ivec, &num,
		                   AES_DECRYPT);

		bytes_written = fwrite(outdata, 1, bytes_read, pOutFile);
		if (bytes_read < AES_BLOCK_SIZE)
			break;
	}
	fclose(pInFile);
	fclose(pOutFile);

}

string combine_files(vector<string> files) {

	string combinedFileName = ((files.at(0)).substr(0, (files.at(0)).find_first_of("_"))) + ".combine";
	ofstream outfile(combinedFileName, std::ofstream::ate | ofstream::binary);
	char * buffer;
	for ( int i = 0 ; i < 3 ; i++ ) {

		ifstream in(files.at(i), std::ifstream::ate | std::ifstream::binary);
		in.seekg (0, in.end);
		int length = in.tellg();
		in.seekg (0, in.beg);

		buffer = new char [length];

		in.read( buffer, length);

		outfile.write((char*) buffer, length);

	}

	return combinedFileName;
}

string createClientKey() {

	string clientKeyFileName = "Client.key";
	FILE *pf ;
	pf = fopen(clientKeyFileName.c_str(), "w");
	unsigned char _firstKey [] = "thiskeyisverybad";
	unsigned char _secondKey [] = "dontusethisinput";

	fwrite(_firstKey, sizeof(char), sizeof(_firstKey), pf);
	fwrite(_secondKey, sizeof(char), sizeof(_secondKey), pf);
	fclose(pf);

	return clientKeyFileName;

}

int main( int argc, char* argv[]) {

	cout << "\nStart\n" << endl;
	int startCount;
	string _keyFilename;

	if ( (string(argv[1])).compare("-key") == 0 ) {
		cout << "Client Key exists" << endl;
		_keyFilename = string(argv[2]);
		FILE* fp;
		if ( (fp = fopen(_keyFilename.c_str(), "r")) == NULL ) {
			throw runtime_error("Your Client Key does not exist");
		}
		startCount = 3;
	} else {
		_keyFilename = createClientKey();
		startCount = 1;
	}

	for ( int i = startCount ; i < argc ; i++ ) {

		vector<string> _newFileNamesInMain;

		cout << "Calling splitFiles\n" << endl;

		_newFileNamesInMain = splitFiles(argv[i]);

		cout << "Calling compress_files\n" << endl;
    
		vector<string> compressed_files = compress_files(_newFileNamesInMain);

		vector<string> encrypted_files = encrypt_files(compressed_files, _keyFilename);

		vector<string> decrypted_files = decrypt_files(encrypted_files, _keyFilename);

		vector<string> decompressed_files = decompress_files(decrypted_files);

		string combinedFileName = combine_files(decompressed_files);

	}

	return 0;

}
