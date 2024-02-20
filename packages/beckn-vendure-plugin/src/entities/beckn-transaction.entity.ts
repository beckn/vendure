import { DeepPartial, VendureEntity } from '@vendure/core';
import { Entity, Column, Index } from 'typeorm';

@Entity()
export class BecknTransaction extends VendureEntity {
    constructor(input?: DeepPartial<BecknTransaction>) {
        super(input);
    }

    @Index()
    @Column()
    becknTransactionId: string;

    @Index()
    @Column()
    vendureAuthToken: string;

    @Column({ nullable: true })
    vendureOrderId: string;

    @Column({ nullable: true })
    vendureToken: string;
}
