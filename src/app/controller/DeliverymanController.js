import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.string().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { name, email, avatar_id } = req.body;

    const deliverymanExists = await Deliveryman.findOne({ where: { email } });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Delivery man already exists' });
    }

    if (avatar_id) {
      const avatarExists = await File.findByPk(avatar_id);

      if (!avatarExists) {
        return res.status(400).json({ error: 'File does not exists' });
      }
    }

    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });

    return res.json(deliveryman);
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    return res.json(deliveryman);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryman = await Deliveryman.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email'],
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { name, email, avatar_id } = req.body;

    if (avatar_id) {
      const avatarExists = await File.findByPk(avatar_id);

      if (!avatarExists) {
        return res.status(400).json({ error: 'File does not exists' });
      }
    }

    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    if (email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    await deliveryman.update({ name, email, avatar_id });

    const { avatar } = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({ id, name, email, avatar });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    const delivery = await Delivery.findOne({
      where: { deliveryman_id: id, end_date: null },
    });

    if (delivery) {
      return res
        .status(400)
        .json({ error: "This Delivery man can't be deleted" });
    }

    await deliveryman.destroy();

    // Verifica se existe avatar para deletar também
    const avatar = await File.findByPk(deliveryman.avatar_id);

    if (avatar) {
      await avatar.destroy();
    }

    return res.json({ message: 'Deliveryman I will be excluded', deliveryman });
  }
}

export default new DeliverymanController();
