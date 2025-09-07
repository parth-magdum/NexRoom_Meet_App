import {useState, useEffect} from 'react';

//This hook takes a MediaStream and returns a number representing the audio level (0-100)
export const useAudioLevel = (stream: MediaStream | undefined | null) => {
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        if(!stream) {
            return;
        }


        //Web audio api setup
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        //COnnect the stream soure to the analyser
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let animationFrameId: number;

        //Function to periodically get audio data
        const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);

            //Calculate the average volume
            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

            //Scale it to a 0-100 range for easier use
            setAudioLevel(average);

            //Continue the loop
            animationFrameId = requestAnimationFrame(updateAudioLevel);
        };

        animationFrameId = requestAnimationFrame(updateAudioLevel);

        //Cleanup function to stop analysis when the component unmounts
        return () => {
            cancelAnimationFrame(animationFrameId);
            source.disconnect();
            analyser.disconnect();
            audioContext.close();
        };
    }, [stream]); //Reruns if stream changes

    return audioLevel;
};