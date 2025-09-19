async function downloadAllFilesFromOrigin() {
    try {
        // Request access to the origin private file system
        const directoryHandle = await window.showDirectoryPicker();

        // Recursively download all files
        async function downloadFilesRecursively(handle, path = '') {
            for await (const entry of handle.values()) {
                const entryPath = path ? `${path}/${entry.name}` : entry.name;

                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    const fileBlob = await file.arrayBuffer();

                    // Create a link element to download the file
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(new Blob([fileBlob]));
                    link.download = entryPath;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else if (entry.kind === 'directory') {
                    // Recursively handle directories
                    await downloadFilesRecursively(entry, entryPath);
                }
            }
        }

        await downloadFilesRecursively(directoryHandle);
        console.log('All files downloaded successfully!');
    } catch (error) {
        console.error('Error accessing the file system:', error);
    }
}

// Call the function to start the process
downloadAllFilesFromOrigin();