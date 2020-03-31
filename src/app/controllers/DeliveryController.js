import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Mail from '../../lib/Mail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
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

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Você tem uma nova entrega',
      template: 'delivery',
      context: {
        deliveryman: deliveryman.name,
        product,
        recipient_name: recipientExists.name,
        recipient_street: recipientExists.street,
        recipient_number: recipientExists.number,
        recipient_complement: recipientExists.complement,
        recipient_state: recipientExists.state,
        recipient_city: recipientExists.city,
        recipient_zip_code: recipientExists.zip_code,
      },
    });

    return res.json(delivery);
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
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

  async index(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
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
      return res.status(400).json({ error: 'validation fails' });
    }

    const { id } = req.params;

    /*
     * Check if delivery exists
     */
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    const recipientExixts = await Recipient.findByPk(recipient_id);

    if (!recipientExixts) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliverymanExixts = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExixts) {
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
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json({ id, product, recipient, deliveryman });
  }

  async delete(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    return res.json(delivery);
  }
}

export default new DeliveryController();
