// Types
import type { CommandOptionsToCreateAnswer } from '../program';

export default abstract class CommandBase {
    constructor(public options?: CommandOptionsToCreateAnswer) {}
}
