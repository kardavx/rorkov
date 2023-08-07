/**
     * Wait for sound to load with timeout. Timeout was implemented in case the sound couldn't load, that created a while infinite loop
     *
     * @param sound The sound object you want to wait for
     * @param timeout The amount of seconds you wanna await a sound, default is 5
     */
export default (sound: Sound, timeout: number = 5) => {
    const startTick = os.clock()

    while(sound.TimeLength === 0) {
        if ((os.clock() - startTick) > timeout) {
            throw `waitForSound timed out on sound of name ${sound.Name} and id ${sound.SoundId}`
        }

        task.wait()
    }
}