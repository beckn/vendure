import { DeepPartial, VendureEntity } from '@vendure/core';
import { Entity, Column, OneToOne } from 'typeorm';

@Entity()
export class BecknTransaction extends VendureEntity {
    constructor(input?: DeepPartial<BecknTransaction>) {
        super(input);
    }

    @Column()
    becknTransactionId: string;

    @Column()
    vendureAuthToken: string;
}
