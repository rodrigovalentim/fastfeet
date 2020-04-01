import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import DeliveryMail from '../jobs/DeliveryMail';
import UpdateDeliveryMail from '../jobs/UpdateDeliveryMail';
import CancellationDeliveryMail from '../jobs/CancellationDeliveryMail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    await Queue.add(DeliveryMail.key, {
      deliveryman,
      recipient,
      product,
    });

    return res.json(delivery);
  }

  async index(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      where: { canceled_at: null },
      attributes: ['id', 'product'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    return res.json(delivery);
  }

  async show(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      where: { canceled_at: null },
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().notRequired(),
      recipient_id: Yup.number().notRequired(),
      deliveryman_id: Yup.number().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      where: { canceled_at: null },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    const recipientExixts = await Recipient.findByPk(recipient_id);

    if (!recipientExixts) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    await delivery.update({ product, recipient_id, deliveryman_id });

    const { recipient, deliveryman } = await Delivery.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (
      delivery.recipient_id !== recipient_id &&
      delivery.deliveryman_id === deliveryman_id
    ) {
      /* alerta troca do destinatario */
      await Queue.add(UpdateDeliveryMail.key, {
        deliveryman,
        recipient,
        product,
      });
    } else if (
      delivery.recipient_id === recipient_id &&
      delivery.deliveryman_id !== deliveryman_id
    ) {
      /* alerta nova entrega para o entregador */
      await Queue.add(DeliveryMail.key, {
        deliveryman,
        recipient,
        product,
      });
    }

    return res.json({ id, product, recipient, deliveryman });
  }

  async delete(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      where: { canceled_at: null },
      attributes: ['id', 'product', 'canceled_at'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    const { deliveryman, recipient, product } = delivery;

    await Queue.add(CancellationDeliveryMail.key, {
      deliveryman,
      recipient,
      product,
    });

    return res.json({ message: 'Delivery has deleted!' });
  }
}

export default new DeliveryController();
